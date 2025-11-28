import {
  AbstractPaymentProvider,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import type { Logger } from "@medusajs/framework/types"
import crypto from "crypto"
import { getBulkSmsClient } from "../../../lib/sms/bulk-sms-bd"

type InjectedDependencies = {
  logger: Logger
}

type CodSessionData = {
  session_id: string
  payment_method: "cod"
  cart?: any
  cart_id?: string
}

const shouldNotify = () => {
  const flag = process.env.BULKSMSBD_NOTIFY_ORDER_PLACED
  if (!flag) {
    return true
  }
  return ["true", "1", "yes"].includes(flag.toLowerCase())
}

export class CodPaymentProvider extends AbstractPaymentProvider {
  static identifier = "cod"

  protected logger_: Logger

  constructor(
    dependencies: InjectedDependencies,
    options: Record<string, unknown>
  ) {
    super(dependencies, options)
    this.logger_ = dependencies.logger
  }

  async initiatePayment({
    amount,
    currency_code,
    context,
    data,
  }: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const sessionId = context?.idempotency_key ?? `cod_${crypto.randomUUID()}`

    this.logger_.info(`[COD] Initiating payment session: ${sessionId}`)

    // Store cart data in session (same as SSLCommerz)
    // Cart can come from context (middleware) or data.data (storefront passes it here)
    const cart = (context as any)?.cart || (data as any)?.data?.cart || (data as any)?.cart
    const cartId = cart?.id || (context as any)?.cart_id || (data as any)?.data?.cart_id || (data as any)?.cart_id

    this.logger_.info(`[COD] Cart from context: ${!!(context as any)?.cart}, Cart from data.data: ${!!(data as any)?.data?.cart}, Cart ID: ${cartId}`)

    const sessionData: CodSessionData & { cart?: any; cart_id?: string } = {
      session_id: sessionId,
      payment_method: "cod",
      cart: cart,
      cart_id: cartId,
    }

    this.logger_.info(`[COD] Storing cart in session: ${!!sessionData.cart}, cart_id: ${sessionData.cart_id}`)

    return {
      id: sessionId,
      status: PaymentSessionStatus.PENDING,
      data: sessionData,
    }
  }

  async authorizePayment({
    data,
    context,
  }: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    this.logger_.info(`[COD] Authorizing payment`)
    this.logger_.info(`[COD] Session data keys: ${Object.keys(data || {}).join(", ")}`)
    this.logger_.info(`[COD] Context keys: ${Object.keys(context || {}).join(", ")}`)

    // COD payments are automatically authorized - customer will pay on delivery
    const result = {
      status: PaymentSessionStatus.AUTHORIZED,
      data,
    }

    // Send SMS after authorization (similar to SSLCommerz)
    if (shouldNotify()) {
      try {
        // Use session data (stored during initiatePayment) - it should have cart data
        const sessionData = data as CodSessionData
        this.logger_.info(`[COD] Attempting to send SMS. Session has cart: ${!!sessionData?.cart}, cart_id: ${sessionData?.cart_id}`)
        await this.sendOrderSms(sessionData, context)
      } catch (error: any) {
        // Don't fail authorization if SMS fails
        this.logger_.warn(`[COD] Failed to send SMS: ${error?.message || error}`)
        this.logger_.error(error)
      }
    }

    return result
  }

  private async sendOrderSms(sessionData: any, context?: any) {
    if (!shouldNotify()) {
      this.logger_.info("[Bulk SMS BD] SMS notifications disabled")
      return
    }

    try {
      // Get cart data from session data first (stored during initiatePayment), then context
      const cart = sessionData?.cart || (context as any)?.cart

      this.logger_.info(`[Bulk SMS BD] COD SMS - Cart from session: ${!!sessionData?.cart}, Cart from context: ${!!(context as any)?.cart}`)

      if (!cart) {
        this.logger_.warn("[Bulk SMS BD] No cart data found in COD session or context")
        this.logger_.warn(`[Bulk SMS BD] Session data keys: ${Object.keys(sessionData || {}).join(", ")}`)
        return
      }

      // Extract phone number from shipping or billing address
      const phone = 
        cart?.shipping_address?.phone ||
        cart?.billing_address?.phone ||
        null

      if (!phone) {
        this.logger_.info(
          `[Bulk SMS BD] No phone number found in COD session. Skipping SMS notification.`
        )
        return
      }

      // Try to get order if it exists, otherwise use cart info (same as SSLCommerz)
      const cartId = cart?.id || sessionData?.cart_id
      let orderNumber = cartId

      // Note: We can't access ORDER module here, so we'll use cart ID
      // The order will be created after authorization, so cart ID is fine for now
      this.logger_.info(`[Bulk SMS BD] Using cart ID ${cartId} as order number for COD`)

      // Send SMS
      const client = getBulkSmsClient()
      const storeName = process.env.BULKSMSBD_BRAND_NAME || "Medusa Store"
      const customerName = `${cart?.shipping_address?.first_name || ''} ${cart?.shipping_address?.last_name || ''}`.trim()
      const message = `Dear ${customerName || 'Customer'}, your ${storeName} order #${orderNumber} was placed successfully. Thank you for shopping with us!`
      
      this.logger_.info(
        `[Bulk SMS BD] Sending SMS for COD order ${orderNumber} to ${phone}`
      )

      const response = await client.send({
        numbers: [phone],
        message,
      })

      this.logger_.info(
        `[Bulk SMS BD] Gateway response for COD order ${orderNumber}: ${JSON.stringify(
          response
        )}`
      )

      if (!response.success) {
        this.logger_.warn(
          `[Bulk SMS BD] Failed to send COD order SMS for ${orderNumber}: ${response.description}`
        )
      } else {
        this.logger_.info(
          `[Bulk SMS BD] Successfully sent COD order SMS for ${orderNumber} to ${phone}`
        )
      }
    } catch (error: any) {
      this.logger_.error(
        `[Bulk SMS BD] Error sending COD SMS: ${error?.message || error}`
      )
      this.logger_.error(error)
    }
  }

  async capturePayment({
    data,
  }: CapturePaymentInput): Promise<CapturePaymentOutput> {
    // COD payments are captured when order is delivered
    return { data }
  }

  async refundPayment({
    data,
    amount,
  }: RefundPaymentInput): Promise<RefundPaymentOutput> {
    // COD refunds are handled manually
    this.logger_.info(`[COD] Refund requested for amount: ${amount}`)
    return { data }
  }

  async cancelPayment({
    data,
  }: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data }
  }

  async deletePayment({
    data,
  }: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data }
  }

  async getPaymentStatus({
    data,
  }: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    return {
      status: PaymentSessionStatus.AUTHORIZED,
      data,
    }
  }

  async retrievePayment({
    data,
  }: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return {
      data,
    }
  }

  async updatePayment({
    data,
  }: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return {
      data,
      status: PaymentSessionStatus.PENDING,
    }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    // COD doesn't use webhooks - payments are handled manually on delivery
    // Return NOT_SUPPORTED for any webhook calls
    return {
      action: PaymentActions.NOT_SUPPORTED,
    }
  }
}
