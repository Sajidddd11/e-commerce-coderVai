import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const sessionId = req.query.session_id as string

  if (!sessionId) {
    return res.status(400).json({
      message: "Missing session_id parameter",
    })
  }

  try {
    const paymentModule = req.scope.resolve(Modules.PAYMENT)
    const session = await paymentModule.retrievePaymentSession(sessionId)

    if (!session) {
      return res.status(404).json({
        message: "Payment session not found",
      })
    }

    // Get cart_id from session data (stored during initiatePayment)
    const sessionData = session.data as any
    const cartId = sessionData?.cart_id || null

    // Log for debugging
    console.log(`[SSLCommerz] Session data:`, JSON.stringify(sessionData, null, 2))
    console.log(`[SSLCommerz] Cart ID from session: ${cartId}`)

    if (!cartId) {
      return res.status(404).json({
        message: "Cart ID not found in payment session. The cart ID should be stored when the payment session is created.",
        session_data_keys: Object.keys(sessionData || {}),
      })
    }

    return res.json({
      cart_id: cartId,
    })
  } catch (error: any) {
    console.error(`[SSLCommerz] Failed to get cart from session:`, error)
    return res.status(500).json({
      message: error?.message || "Failed to retrieve cart",
    })
  }
}

