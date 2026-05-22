import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  authorizeSslSession,
  respondWithRedirect,
} from "../../store/sslcommerz/utils"
import { getBulkSmsClient } from "../../../lib/sms/bulk-sms-bd"
import { sendOrderConfirmationEmail } from "../../../lib/email"

const shouldNotify = () => {
  const flag = process.env.SMSNETBD_NOTIFY_ORDER_PLACED
  if (!flag) {
    return true
  }

  return ["true", "1", "yes"].includes(flag.toLowerCase())
}

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Background task: resolves the most recent order for the cart's email
 * and sends an SMS with the final order number. Runs asynchronously so
 * it does not block the SSLCommerz redirect back to the storefront.
 */
const sendOrderSms = async (req: MedusaRequest, sessionId: string) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  if (!shouldNotify()) {
    logger.info("[Bulk SMS BD] SMS notifications disabled")
    return
  }

  try {
    const paymentModule = req.scope.resolve(Modules.PAYMENT)
    const orderModuleService = req.scope.resolve(Modules.ORDER)

    // Load payment session to get cart context and phone
    const session = await paymentModule.retrievePaymentSession(sessionId)

    if (!session) {
      logger.warn(`[Bulk SMS BD] Payment session ${sessionId} not found`)
      return
    }

    const sessionData = session.data as any
    const cart = sessionData?.cart

    if (!cart) {
      logger.warn("[Bulk SMS BD] No cart data found in session")
      return
    }

    const phone =
      cart?.shipping_address?.phone ||
      cart?.billing_address?.phone ||
      null

    if (!phone) {
      logger.info(
        `[Bulk SMS BD] No phone number found in session ${sessionId}. Skipping SMS notification.`
      )
      return
    }

    const cartId = cart?.id || sessionData?.cart_id
    const email = cart?.email
    let orderNumber: string | null = null

    // Resolve order by most recent order for this email, with retries to
    // avoid racing the order creation workflow.
    if (email) {
      const maxAttempts = 4
      const delayMs = 3000
      const initialDelayMs = 8000

      // Give the order creation workflow some time before first lookup
      logger.info(
        `[Bulk SMS BD] Waiting ${initialDelayMs}ms before resolving order for email ${email} (SSLCommerz)`
      )
      await sleep(initialDelayMs)

      for (let attempt = 1; attempt <= maxAttempts && !orderNumber; attempt++) {
        try {
          const orders = await orderModuleService.listOrders(
            { email } as any,
            {
              take: 1,
              order: {
                created_at: "DESC",
              },
            } as any
          )

          let list: any[] | undefined

          if (Array.isArray(orders)) {
            list = orders
          } else if ((orders as any)?.data && Array.isArray((orders as any).data)) {
            list = (orders as any).data
          }

          if (list && list.length > 0) {
            const order = list[0] as any
            orderNumber = order.display_id ?? order.id
            logger.info(
              `[Bulk SMS BD] Found latest order ${orderNumber} for email ${email} (SSLCommerz, attempt ${attempt})`
            )
            break
          } else {
            logger.info(
              `[Bulk SMS BD] No order found yet for email ${email} on attempt ${attempt}/${maxAttempts}`
            )
          }
        } catch (error: any) {
          logger.warn(
            `[Bulk SMS BD] Could not fetch order for email ${email} on attempt ${attempt}/${maxAttempts}: ${error.message}`
          )
        }

        if (attempt < maxAttempts) {
          await sleep(delayMs)
        }
      }

      if (!orderNumber) {
        logger.info(
          `[Bulk SMS BD] Failed to resolve order by email ${email} after retries, falling back to cart ID`
        )
      }
    }

    // Fallbacks if we couldn't resolve the order yet
    const reference = orderNumber || cartId || sessionId

    // Send SMS
    const client = getBulkSmsClient()
    const storeName = process.env.SMSNETBD_BRAND_NAME || "Medusa Store"
    const customerName = `${
      cart?.shipping_address?.first_name || ""
    } ${cart?.shipping_address?.last_name || ""}`.trim()
    const message = `Dear ${
      customerName || "Customer"
    }, your ${storeName} order #${reference} was placed successfully. Thank you for shopping with us!`

    logger.info(
      `[Bulk SMS BD] Sending SSLCommerz order SMS for reference ${reference} to ${phone}`
    )

    const response = await client.send({
      numbers: [phone],
      message,
    })

    logger.info(
      `[Bulk SMS BD] Gateway response for SSLCommerz order ${reference}: ${JSON.stringify(
        response
      )}`
    )

    if (!response.success) {
      logger.warn(
        `[Bulk SMS BD] Failed to send SSLCommerz order SMS for ${reference}: ${response.description}`
      )
    } else {
      logger.info(
        `[Bulk SMS BD] Successfully sent SSLCommerz order SMS for ${reference} to ${phone}`
      )
    }

    // Best-effort: send order confirmation email
    const emailAddress = cart?.email
    if (emailAddress) {
      const storeName = process.env.SMSNETBD_BRAND_NAME || "Zahan"
      sendOrderConfirmationEmail({
        to: emailAddress,
        name: customerName || "Customer",
        orderNumber: reference,
        orderTotal: `BDT ${Number(cart?.total ?? 0).toLocaleString()}`,
      }).then((result) => {
        if (result.success) {
          logger.info(`[Brevo] Order confirmation email sent to ${emailAddress} for order ${reference}`)
        } else {
          logger.warn(`[Brevo] Failed to send order confirmation email for ${reference}: ${result.error}`)
        }
      }).catch((err: any) => {
        logger.error(`[Brevo] Order confirmation email error for ${reference}: ${err?.message}`)
      })
    }
  } catch (error: any) {
    logger.error(
      `[Bulk SMS BD] Error sending SSLCommerz order SMS: ${error?.message || error}`
    )
    logger.error(error)
  }
}

const handleCallback = async (req: MedusaRequest, res: MedusaResponse) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  // Get session_id from query params (we add it to callback URLs)
  const sessionId = (req.query?.session_id as string) || null

  if (!sessionId) {
    return res.status(400).json({
      message: "Missing session_id in callback URL",
    })
  }

  let paymentCollectionId: string | null = null
  try {
    const result = await authorizeSslSession(req, sessionId, "success")
    paymentCollectionId = result?.payment_collection_id || null

    // Kick off SMS sending in the background so we don't block the redirect
    logger.info(
      `[Bulk SMS BD] SSLCommerz payment authorized for session ${sessionId}, scheduling SMS in background...`
    )
    sendOrderSms(req, sessionId).catch((err: any) => {
      logger.error(
        `[Bulk SMS BD] Background SSLCommerz SMS task failed for session ${sessionId}: ${
          err?.message || err
        }`
      )
    })
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Failed to authorize SSLCommerz session",
      session_id: sessionId,
    })
  }

  return await respondWithRedirect(
    req,
    res,
    "success",
    sessionId,
    paymentCollectionId
  )
}

export const POST = (req: MedusaRequest, res: MedusaResponse) =>
  handleCallback(req, res)

export const GET = (req: MedusaRequest, res: MedusaResponse) =>
  handleCallback(req, res)

