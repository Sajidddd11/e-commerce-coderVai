import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getBulkSmsClient } from "../../../../lib/sms/bulk-sms-bd"
import { validateAndNormalizeBDPhone } from "../../../../lib/sms/phone-validator"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const { order_id } = req.body as { order_id?: string }

  if (!order_id) {
    return res.status(400).json({ message: "order_id is required" })
  }

  // Check if SMS notifications are enabled
  const flag = process.env.BULKSMSBD_NOTIFY_ORDER_PLACED
  if (flag && !["true", "1", "yes"].includes(flag.toLowerCase())) {
    logger.info("[Bulk SMS BD] SMS notifications are disabled")
    return res.status(200).json({ message: "SMS notifications disabled", sent: false })
  }

  try {
    const orderModuleService = req.scope.resolve(Modules.ORDER)

    logger.info(`[Bulk SMS BD] Fetching order ${order_id} with shipping/billing relations`)
    
    const order = await orderModuleService.retrieveOrder(order_id, {
      relations: ["shipping_address", "billing_address"],
      select: ["id", "display_id"],
    })

    logger.info(`[Bulk SMS BD] Loaded order ${order.id} display #${order.display_id}`)

    const phone = order?.shipping_address?.phone || order?.billing_address?.phone || null

    if (!phone) {
      logger.info(`[Bulk SMS BD] Order ${order.id} does not include a phone number`)
      return res.status(200).json({ 
        message: "No phone number found on order", 
        sent: false 
      })
    }

    // Validate and normalize phone number
    const phoneValidation = validateAndNormalizeBDPhone(phone)
    if (!phoneValidation.isValid) {
      logger.warn(`[Bulk SMS BD] Order ${order.id} has invalid phone number: ${phoneValidation.error}`)
      return res.status(200).json({ 
        message: `Invalid phone number: ${phoneValidation.error}`, 
        sent: false 
      })
    }

    const normalizedPhone = phoneValidation.normalized!
    const client = getBulkSmsClient()
    const storeName = process.env.BULKSMSBD_BRAND_NAME || "Medusa Store"
    const orderNumber = order.display_id ?? order.id
    const message = `Your ${storeName} order #${orderNumber} was placed successfully.`

    logger.info(`[Bulk SMS BD] Sending SMS for order ${orderNumber} to validated phone number`)

    const response = await client.send({
      numbers: [normalizedPhone],
      message,
    })

    logger.info(`[Bulk SMS BD] Gateway response for order ${orderNumber}: ${JSON.stringify(response)}`)

    if (!response.success) {
      logger.warn(`[Bulk SMS BD] Failed to send order placed SMS for ${orderNumber}: ${response.description}`)
      return res.status(500).json({
        message: `Failed to send SMS: ${response.description}`,
        sent: false,
        details: response,
      })
    }

    logger.info(`[Bulk SMS BD] Sent order placed SMS for ${orderNumber}`)
    
    return res.status(200).json({
      message: "SMS sent successfully",
      sent: true,
      order_number: orderNumber,
      phone: normalizedPhone.slice(-4).padStart(normalizedPhone.length, '*'), // masked
    })

  } catch (error: any) {
    logger.error(`[Bulk SMS BD] Unable to send order placed SMS for ${order_id}: ${error?.message || error}`)
    logger.error(error)
    
    return res.status(500).json({
      message: error?.message || "Failed to send SMS",
      sent: false,
    })
  }
}

