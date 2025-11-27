import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  authorizeSslSession,
  respondWithRedirect,
} from "../../store/sslcommerz/utils"
import { getBulkSmsClient } from "../../../lib/sms/bulk-sms-bd"

const shouldNotify = () => {
  const flag = process.env.BULKSMSBD_NOTIFY_ORDER_PLACED
  if (!flag) {
    return true
  }

  return ["true", "1", "yes"].includes(flag.toLowerCase())
}

const sendOrderSms = async (req: MedusaRequest, sessionId: string) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  
  if (!shouldNotify()) {
    logger.info("[Bulk SMS BD] SMS notifications disabled")
    return
  }

  try {
    // Get the payment session to extract customer data
    const paymentModule = req.scope.resolve(Modules.PAYMENT)
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

    // Extract phone number from shipping or billing address
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

    // Try to get order if it exists, otherwise use cart info
    const cartId = cart?.id || sessionData?.cart_id
    let orderNumber = cartId

    // Try to fetch the order
    try {
      const orderModuleService = req.scope.resolve(Modules.ORDER)
      const orders = await orderModuleService.listOrders(
        { id: cartId },
        { take: 1 }
      )
      
      if (orders && orders.length > 0) {
        const order = orders[0]
        orderNumber = order.display_id ?? order.id
        logger.info(`[Bulk SMS BD] Found order ${orderNumber} for cart ${cartId}`)
      } else {
        logger.info(`[Bulk SMS BD] No order found yet for cart ${cartId}, using cart ID`)
      }
    } catch (error: any) {
      logger.warn(`[Bulk SMS BD] Could not fetch order: ${error.message}`)
    }

    // Send SMS
    const client = getBulkSmsClient()
    const storeName = process.env.BULKSMSBD_BRAND_NAME || "Medusa Store"
    const customerName = `${cart?.shipping_address?.first_name || ''} ${cart?.shipping_address?.last_name || ''}`.trim()
    const message = `Dear ${customerName || 'Customer'}, your ${storeName} order #${orderNumber} was placed successfully. Thank you for shopping with us!`
    
    logger.info(
      `[Bulk SMS BD] Sending SMS for order ${orderNumber} to ${phone}`
    )

    const response = await client.send({
      numbers: [phone],
      message,
    })

    logger.info(
      `[Bulk SMS BD] Gateway response for order ${orderNumber}: ${JSON.stringify(
        response
      )}`
    )

    if (!response.success) {
      logger.warn(
        `[Bulk SMS BD] Failed to send order placed SMS for ${orderNumber}: ${response.description}`
      )
    } else {
      logger.info(
        `[Bulk SMS BD] Successfully sent order SMS for ${orderNumber} to ${phone}`
      )
    }
  } catch (error: any) {
    logger.error(
      `[Bulk SMS BD] Error sending SMS: ${error?.message || error}`
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
    
    // Send SMS after successful authorization
    logger.info(`[Bulk SMS BD] Payment authorized for session ${sessionId}, sending SMS...`)
    await sendOrderSms(req, sessionId)
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Failed to authorize SSLCommerz session",
      session_id: sessionId,
    })
  }

  return await respondWithRedirect(req, res, "success", sessionId, paymentCollectionId)
}

export const POST = (req: MedusaRequest, res: MedusaResponse) => handleCallback(req, res)

export const GET = (req: MedusaRequest, res: MedusaResponse) => handleCallback(req, res)

