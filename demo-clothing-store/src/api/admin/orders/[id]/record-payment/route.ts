import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { capturePaymentWorkflow } from "@medusajs/core-flows"

// ──────────────────────────────────────────────────────────────────
// GET  /admin/orders/:id/record-payment
// Returns payment summary: total, captured, outstanding, history
// ──────────────────────────────────────────────────────────────────
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: orderId } = req.params

  const orderModule = req.scope.resolve(Modules.ORDER)
  const paymentModule = req.scope.resolve(Modules.PAYMENT)
  const remoteQuery = req.scope.resolve("remoteQuery")

  try {
    const order = await orderModule.retrieveOrder(orderId, {
      relations: ["summary"],
    })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Get payment collection
    const paymentLinks = await remoteQuery({
      entryPoint: "order_payment_collection",
      fields: ["order_id", "payment_collection_id"],
      variables: { filters: { order_id: orderId } },
    })

    let paymentSummary = {
      status: "not_paid",
      total: 0,
      captured_amount: 0,
      authorized_amount: 0,
      payment_collection_id: null as string | null,
      currency_code: null as string | null,
    }

    if (paymentLinks?.length > 0) {
      const paymentCollectionId = paymentLinks[0].payment_collection_id
      const collection = await paymentModule.retrievePaymentCollection(paymentCollectionId)
      paymentSummary = {
        status: (collection as any).status || "not_paid",
        total: Number((collection as any).amount || 0),
        captured_amount: Number((collection as any).captured_amount || 0),
        authorized_amount: Number((collection as any).authorized_amount || 0),
        payment_collection_id: paymentCollectionId,
        currency_code: (collection as any).currency_code || null,
      }
    }

    // The payment_collection.amount IS the gross order total in Medusa v2 — it stays
    // constant regardless of captures. Captures only update captured_amount/status.
    // Fall back to order.summary only if no payment collection exists.
    const orderTotal = paymentSummary.total > 0
      ? paymentSummary.total
      : Number(
          (order as any).summary?.current_order_total ??
          (order as any).summary?.accounting_total ??
          0
        )

    const capturedAmount = paymentSummary.captured_amount
    const outstandingAmount = Math.max(0, orderTotal - capturedAmount)

    const manualPayments: any[] = ((order.metadata as any)?.manual_payments as any[]) || []

    return res.json({
      order_id: orderId,
      currency_code:
        paymentSummary.currency_code || (order as any).currency_code || null,
      order_total: orderTotal,
      captured_amount: capturedAmount,
      outstanding_amount: outstandingAmount,
      payment_status: paymentSummary.status,
      payment_collection_id: paymentSummary.payment_collection_id,
      manual_payments: manualPayments,
    })
  } catch (error: any) {
    console.error("Error fetching payment summary:", error)
    return res.status(500).json({ message: error?.message || "Failed to fetch payment summary" })
  }
}

// ──────────────────────────────────────────────────────────────────
// POST /admin/orders/:id/record-payment
// Body: { amount: number, note?: string }
// Records an offline / manual partial payment
// ──────────────────────────────────────────────────────────────────
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: orderId } = req.params
  const { amount, note } = req.body as { amount: number; note?: string }

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number" })
  }

  const parsedAmount = Number(amount)

  const orderModule = req.scope.resolve(Modules.ORDER)
  const paymentModule = req.scope.resolve(Modules.PAYMENT)
  const remoteQuery = req.scope.resolve("remoteQuery")

  try {
    const order = await orderModule.retrieveOrder(orderId)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // 1. Get payment collection for this order
    const paymentLinks = await remoteQuery({
      entryPoint: "order_payment_collection",
      fields: ["order_id", "payment_collection_id"],
      variables: { filters: { order_id: orderId } },
    })

    if (!paymentLinks?.length) {
      return res.status(400).json({ message: "No payment collection found for this order" })
    }

    const paymentCollectionId = paymentLinks[0].payment_collection_id

    // Fetch the collection to source currency_code reliably (it's a required column on the model)
    const collection = await paymentModule.retrievePaymentCollection(paymentCollectionId)
    const currencyCode: string | undefined =
      (collection as any).currency_code || (order as any).currency_code

    if (!currencyCode) {
      return res.status(400).json({
        message: "Could not resolve currency_code from order/payment collection",
      })
    }

    // The Medusa core Payment Module always registers the System provider as `pp_system_default`
    // (see @medusajs/payment/dist/loaders/providers.js). No config required.
    const providerId = "pp_system_default"

    // 1. Create a new payment session via the DOMAIN method (singular!).
    //    Note: `createPaymentSessions` (plural) is an auto-generated CRUD wrapper that
    //    bypasses domain logic and drops DTO fields, which produced the empty
    //    PaymentSession (currency_code undefined) ValidationError previously.
    let session: any
    try {
      session = await (paymentModule as any).createPaymentSession(paymentCollectionId, {
        provider_id: providerId,
        amount: parsedAmount,
        currency_code: currencyCode,
        data: {
          type: "manual_partial_payment",
          note: note || "",
          recorded_at: new Date().toISOString(),
        },
      })
    } catch (sessionErr: any) {
      console.error("Error creating payment session:", sessionErr)
      return res.status(500).json({
        message: `Failed to create payment session: ${sessionErr?.message}`,
      })
    }

    if (!session?.id) {
      return res.status(500).json({ message: "Payment session was not created" })
    }

    // 2. Authorize the session. The system provider auto-authorizes without an external
    //    gateway and `authorizePaymentSession` returns the resulting PaymentDTO directly.
    //    Signature is (id, context, sharedContext?) where `context` is a flat record.
    let payment: any
    try {
      payment = await paymentModule.authorizePaymentSession(session.id, {
        type: "manual",
        recorded_by: (req as any).auth_context?.actor_id || "admin",
      })
    } catch (authErr: any) {
      console.error("Error authorizing payment session:", authErr)
      return res.status(500).json({
        message: `Failed to authorize payment session: ${authErr?.message}`,
      })
    }

    // 3. Capture via the core capture-payment workflow. This not only captures the
    //    payment in the Payment Module, it also writes an OrderTransaction so the
    //    order's summary panel (Paid Total / Outstanding amount) reflects reality.
    //    Calling paymentModule.capturePayment directly would skip the order-transaction
    //    side-effect, leaving the native Order > Summary panel showing stale numbers.
    let captured = false
    try {
      if (payment?.id) {
        await capturePaymentWorkflow(req.scope).run({
          input: {
            payment_id: payment.id,
            amount: parsedAmount,
            captured_by: (req as any).auth_context?.actor_id || "admin",
          },
        })
        captured = true
      }
    } catch (captureErr: any) {
      console.error("Error capturing payment:", captureErr)
      // Don't fail the whole request — session is authorized; log it in metadata
    }

    // 4. Persist a manual-payment log entry on the order metadata
    const existingMetadata: any = (order.metadata as any) || {}
    const manualPayments: any[] = (existingMetadata.manual_payments as any[]) || []

    manualPayments.push({
      amount: parsedAmount,
      note: note || "",
      recorded_at: new Date().toISOString(),
      recorded_by: (req as any).auth_context?.actor_id || "admin",
      session_id: session.id,
      payment_id: payment?.id,
      captured,
    })

    await orderModule.updateOrders(orderId, {
      metadata: {
        ...existingMetadata,
        manual_payments: manualPayments,
      },
    })

    // 5. Return updated payment state
    const finalCollection = await paymentModule.retrievePaymentCollection(paymentCollectionId)

    return res.json({
      success: true,
      recorded_amount: parsedAmount,
      captured,
      payment_collection: {
        id: paymentCollectionId,
        status: (finalCollection as any).status,
        amount: Number((finalCollection as any).amount || 0),
        captured_amount: Number((finalCollection as any).captured_amount || 0),
      },
      manual_payments: manualPayments,
    })
  } catch (error: any) {
    console.error("Error recording manual payment:", error)
    return res.status(500).json({ message: error?.message || "Failed to record payment" })
  }
}
