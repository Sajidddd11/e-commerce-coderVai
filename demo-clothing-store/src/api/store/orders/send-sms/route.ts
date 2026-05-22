import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getBulkSmsClient } from "../../../../lib/sms/bulk-sms-bd"
import { validateAndNormalizeBDPhone } from "../../../../lib/sms/phone-validator"
import { sendOrderConfirmationEmail, OrderEmailItem } from "../../../../lib/email"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const { order_id } = req.body as { order_id?: string }

  if (!order_id) {
    return res.status(400).json({ message: "order_id is required" })
  }

  // Check if SMS notifications are enabled
  const flag = process.env.SMSNETBD_NOTIFY_ORDER_PLACED
  if (flag && !["true", "1", "yes"].includes(flag.toLowerCase())) {
    logger.info("[sms.net.bd] SMS notifications are disabled")
    return res.status(200).json({ message: "SMS notifications disabled", sent: false })
  }

  try {
    const orderModuleService = req.scope.resolve(Modules.ORDER)

    logger.info(`[sms.net.bd] Fetching order ${order_id} with shipping/billing relations`)
    
    const order = await orderModuleService.retrieveOrder(order_id, {
      relations: [
        "shipping_address",
        "billing_address",
        "items",
        "items.detail",
      ],
      select: ["id", "display_id", "email", "currency_code", "total"],
    })

    logger.info(`[sms.net.bd] Loaded order ${order.id} display #${order.display_id}`)

    const phone = order?.shipping_address?.phone || order?.billing_address?.phone || null

    if (!phone) {
      logger.info(`[sms.net.bd] Order ${order.id} does not include a phone number`)
      return res.status(200).json({ 
        message: "No phone number found on order", 
        sent: false 
      })
    }

    // Validate and normalize phone number
    const phoneValidation = validateAndNormalizeBDPhone(phone)
    if (!phoneValidation.isValid) {
      logger.warn(`[sms.net.bd] Order ${order.id} has invalid phone number: ${phoneValidation.error}`)
      return res.status(200).json({ 
        message: `Invalid phone number: ${phoneValidation.error}`, 
        sent: false 
      })
    }

    const normalizedPhone = phoneValidation.normalized!
    const client = getBulkSmsClient()
    const storeName = process.env.SMSNETBD_BRAND_NAME || "Medusa Store"
    const orderNumber = order.display_id ?? order.id
    const message = `Your ${storeName} order #${orderNumber} was placed successfully.`

    logger.info(`[sms.net.bd] Sending SMS for order ${orderNumber} to validated phone number`)

    const response = await client.send({
      numbers: [normalizedPhone],
      message,
    })

    logger.info(`[sms.net.bd] Gateway response for order ${orderNumber}: ${JSON.stringify(response)}`)

    if (!response.success) {
      logger.warn(`[sms.net.bd] Failed to send order placed SMS for ${orderNumber}: ${response.description}`)
      return res.status(500).json({
        message: `Failed to send SMS: ${response.description}`,
        sent: false,
        details: response,
      })
    }

    logger.info(`[sms.net.bd] Sent order placed SMS for ${orderNumber}`)

    // Best-effort: send order confirmation email with product details
    if (order.email) {
      const customerName = [
        order.shipping_address?.first_name,
        order.shipping_address?.last_name,
      ].filter(Boolean).join(" ") || "Customer"

      const currency = order.currency_code?.toUpperCase() ?? "BDT"

      // Build item list from order line items
      const items: OrderEmailItem[] = ((order as any).items ?? []).map((item: any) => {
        const unitPrice = Number(item.unit_price ?? 0)
        const qty = Number(item.quantity ?? 1)
        // Try to get thumbnail from variant or product
        const imageUrl =
          item.thumbnail ||
          item.variant?.thumbnail ||
          item.product?.thumbnail ||
          undefined

        return {
          name: item.product_title || item.title || "Product",
          variant: item.variant_title || undefined,
          qty,
          price: `${currency} ${(unitPrice * qty).toLocaleString()}`,
          imageUrl,
        } as OrderEmailItem
      })

      sendOrderConfirmationEmail({
        to: order.email,
        name: customerName,
        orderNumber,
        orderTotal: `${currency} ${Number(order.total ?? 0).toLocaleString()}`,
        items,
        shippingAddress: order.shipping_address ? {
          line1: order.shipping_address.address_1 || undefined,
          line2: order.shipping_address.address_2 || undefined,
          city: order.shipping_address.city || undefined,
        } : undefined,
      }).then((result) => {
        if (result.success) {
          logger.info(`[Brevo] Order confirmation email sent to ${order.email}`)
        } else {
          logger.warn(`[Brevo] Failed to send order confirmation email: ${result.error}`)
        }
      }).catch((err: any) => {
        logger.error(`[Brevo] Order confirmation email error: ${err?.message}`)
      })
    }
    
    return res.status(200).json({
      message: "SMS sent successfully",
      sent: true,
      order_number: orderNumber,
      phone: normalizedPhone.slice(-4).padStart(normalizedPhone.length, '*'), // masked
    })

  } catch (error: any) {
    logger.error(`[sms.net.bd] Unable to send order placed SMS for ${order_id}: ${error?.message || error}`)
    logger.error(error)
    
    return res.status(500).json({
      message: error?.message || "Failed to send SMS",
      sent: false,
    })
  }
}

