import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getBulkSmsClient } from "../lib/sms/bulk-sms-bd"

const shouldNotify = () => {
  const flag = process.env.BULKSMSBD_NOTIFY_ORDER_PLACED
  if (!flag) {
    return true // Default to enabled
  }
  return ["true", "1", "yes"].includes(flag.toLowerCase())
}

export default async function orderPlacedSmsHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const orderId = data.id

  if (!shouldNotify()) {
    logger.info("[Bulk SMS BD] SMS notifications disabled")
    return
  }

  try {
    logger.info(`[Bulk SMS BD] order.placed event received for order: ${orderId}`)

    const orderModuleService = container.resolve(Modules.ORDER)

    // Retrieve order with shipping and billing addresses
    const order = await orderModuleService.retrieveOrder(orderId, {
      relations: ["shipping_address", "billing_address"],
    })

    logger.info(`[Bulk SMS BD] Loaded order ${order.id} display #${order.display_id}`)

    // Extract phone number from shipping or billing address (same as SSLCommerz)
    const phone = order?.shipping_address?.phone || order?.billing_address?.phone || null

    if (!phone) {
      logger.info(
        `[Bulk SMS BD] No phone number found for order ${order.id}. Skipping SMS notification.`
      )
      return
    }

    // Prepare SMS message
    const client = getBulkSmsClient()
    const storeName = process.env.BULKSMSBD_BRAND_NAME || "Medusa Store"
    const orderNumber = order.display_id ?? order.id
    
    // Get customer name from shipping or billing address
    const customerName = 
      `${order?.shipping_address?.first_name || ''} ${order?.shipping_address?.last_name || ''}`.trim() ||
      `${order?.billing_address?.first_name || ''} ${order?.billing_address?.last_name || ''}`.trim() ||
      "Customer"
    
    const message = `Dear ${customerName}, your ${storeName} order #${orderNumber} was placed successfully. Thank you for shopping with us!`

    logger.info(
      `[Bulk SMS BD] Sending SMS for order ${orderNumber} to ${phone}`
    )

    const response = await client.send({
      numbers: [phone],
      message,
    })

    logger.info(`[Bulk SMS BD] Gateway response for order ${orderNumber}: ${JSON.stringify(response)}`)

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
      `[Bulk SMS BD] Error sending SMS for order ${orderId}: ${error?.message || error}`
    )
    logger.error(error)
    // Don't throw - we don't want SMS failures to break order placement
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}

