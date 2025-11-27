import {
  AbstractPaymentProvider,
  MedusaError,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import { BigNumber } from "@medusajs/utils"
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
import type { BigNumberInput } from "@medusajs/types"
import type { Logger } from "@medusajs/framework/types"
import crypto from "crypto"
import { getSslCommerzClient, withDefaultTransactionData } from "../../../lib/sslcommerz"
import { upstashRedis } from "../../../lib/redis/upstash"
import { Modules } from "@medusajs/framework/utils"

type InjectedDependencies = {
  logger: Logger
}

type SslCommerzSessionData = {
  tran_id: string
  gateway_url?: string
  payload?: Record<string, unknown>
  provider_response?: Record<string, unknown>
  last_validation?: Record<string, unknown>
  cart_id?: string
}

const SUCCESS_STATUSES = new Set(["VALID", "VALIDATED", "AUTHORIZED", "COMPLETED", "PAID"])
const FAILURE_STATUSES = new Set(["FAILED", "CANCELLED", "CANCELED", "INVALID"])

export class SSLCommerzPaymentProvider extends AbstractPaymentProvider {
  static identifier = "sslcommerz"

  protected logger_: Logger

  constructor(
    dependencies: InjectedDependencies,
    options: Record<string, unknown>
  ) {
    super(dependencies, options)
    this.logger_ = dependencies.logger
  }

  static normalizeAmount(amount: BigNumberInput, currencyCode?: string) {
    try {
      const bigNumber = new BigNumber(amount ?? 0)
      return Number(bigNumber.numeric.toFixed(2))
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unable to normalize amount for ${currencyCode ?? "unknown currency"}`
      )
    }
  }

  protected buildCallbackUrl(url: string | undefined, sessionId: string, cartId?: string | null) {
    if (!url) {
      return undefined
    }

    try {
      const parsedUrl = new URL(url)
      parsedUrl.searchParams.set("session_id", sessionId)
      if (cartId) {
        parsedUrl.searchParams.set("cart_id", cartId)
      }
      return parsedUrl.toString()
    } catch {
      return url
    }
  }

  /**
   * Extracts customer data directly from cart object (best for guest checkouts)
   */
  protected extractCustomerDataFromCart(cart: any) {
    this.logger_.info(`[SSLCommerz] Extracting customer data from cart: ${cart.id}`)

    const billingAddress = cart.billing_address
    const shippingAddress = cart.shipping_address
    const address = billingAddress || shippingAddress

    // Email is directly on cart table
    const email = cart.email || "no-reply@example.com"

    // Phone from address
    let phoneNumber = billingAddress?.phone || shippingAddress?.phone || "01700000000"
    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
      phoneNumber = "01700000000"
    }

    // Name from address
    const firstName = billingAddress?.first_name || shippingAddress?.first_name || ""
    const lastName = billingAddress?.last_name || shippingAddress?.last_name || ""
    const fullName = `${firstName} ${lastName}`.trim() || billingAddress?.company || "Customer"

    const customerData = {
      cus_name: fullName,
      cus_email: email,
      cus_add1: billingAddress?.address_1 || shippingAddress?.address_1 || "Address Line 1",
      cus_add2: billingAddress?.address_2 || shippingAddress?.address_2 || "",
      cus_city: billingAddress?.city || shippingAddress?.city || "City",
      cus_state: billingAddress?.province || shippingAddress?.province || "State",
      cus_postcode: billingAddress?.postal_code || shippingAddress?.postal_code || "0000",
      cus_country: (billingAddress?.country_code || shippingAddress?.country_code || "BD").toUpperCase(),
      cus_phone: phoneNumber,
      // Shipping address
      ship_name: fullName,
      ship_add1: shippingAddress?.address_1 || billingAddress?.address_1 || "Address Line 1",
      ship_add2: shippingAddress?.address_2 || billingAddress?.address_2 || "",
      ship_city: shippingAddress?.city || billingAddress?.city || "City",
      ship_state: shippingAddress?.province || billingAddress?.province || "State",
      ship_postcode: shippingAddress?.postal_code || billingAddress?.postal_code || "0000",
      ship_country: (shippingAddress?.country_code || billingAddress?.country_code || "BD").toUpperCase(),
    }

    this.logger_.info(`[SSLCommerz] Extracted customer data from cart: ${JSON.stringify(customerData, null, 2)}`)
    return customerData
  }

  /**
   * Extracts customer data from context (fallback method, doesn't work well for guests)
   */
  protected extractCustomerData(context: InitiatePaymentInput["context"]) {
    // Log the entire context for debugging
    this.logger_.info(`[SSLCommerz] Extracting customer data from context: ${JSON.stringify(context, null, 2)}`)

    const customer = context?.customer
    
    // For guest checkouts, billing/shipping address might be directly in context
    const billingAddress = customer?.billing_address || (context as any)?.billing_address
    const shippingAddress = (customer as any)?.shipping_address || (context as any)?.shipping_address
    
    // Use billing address as primary, fallback to shipping
    const address = billingAddress || shippingAddress

    // Extract email - check multiple locations for guest vs logged-in
    const email = 
      customer?.email ||
      (context as any)?.email ||
      billingAddress?.email ||
      shippingAddress?.email ||
      "no-reply@example.com"

    // Extract phone number with multiple fallbacks
    let phoneNumber =
      customer?.phone ||
      (customer as any)?.metadata?.phone ||
      billingAddress?.phone ||
      shippingAddress?.phone ||
      (billingAddress as any)?.phone_number ||
      (shippingAddress as any)?.phone_number ||
      "01700000000" // Default valid BD phone format

    // Ensure phone is a non-empty string
    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
      phoneNumber = "01700000000"
    }

    // Extract name - check both customer and address objects
    const firstName = 
      customer?.first_name || 
      billingAddress?.first_name || 
      shippingAddress?.first_name ||
      ""
    
    const lastName = 
      customer?.last_name || 
      billingAddress?.last_name || 
      shippingAddress?.last_name ||
      ""

    const fullName =
      `${firstName} ${lastName}`.trim() ||
      customer?.company_name ||
      billingAddress?.company ||
      shippingAddress?.company ||
      "Customer"

    // Billing address details
    const customerData = {
      cus_name: fullName,
      cus_email: email,
      cus_add1: billingAddress?.address_1 || shippingAddress?.address_1 || "Address Line 1",
      cus_add2: billingAddress?.address_2 || shippingAddress?.address_2 || "",
      cus_city: billingAddress?.city || shippingAddress?.city || "City",
      cus_state: billingAddress?.province || shippingAddress?.province || "State",
      cus_postcode: billingAddress?.postal_code || shippingAddress?.postal_code || "0000",
      cus_country: (billingAddress?.country_code || shippingAddress?.country_code || "BD").toUpperCase(),
      cus_phone: phoneNumber,
      // Shipping address details (prefer shipping if available, otherwise use billing)
      ship_name: fullName,
      ship_add1: shippingAddress?.address_1 || billingAddress?.address_1 || "Address Line 1",
      ship_add2: shippingAddress?.address_2 || billingAddress?.address_2 || "",
      ship_city: shippingAddress?.city || billingAddress?.city || "City",
      ship_state: shippingAddress?.province || billingAddress?.province || "State",
      ship_postcode: shippingAddress?.postal_code || billingAddress?.postal_code || "0000",
      ship_country: (shippingAddress?.country_code || billingAddress?.country_code || "BD").toUpperCase(),
    }

    this.logger_.info(`[SSLCommerz] Extracted customer data: ${JSON.stringify(customerData, null, 2)}`)
    return customerData
  }

  protected async queryTransaction(tranId: string) {
    const client = getSslCommerzClient()
    return client.transactionQueryByTransactionId({ tran_id: tranId })
  }

  protected mapStatus(status?: string) {
    if (!status) {
      return PaymentSessionStatus.PENDING
    }

    const normalized = status.toUpperCase()

    if (SUCCESS_STATUSES.has(normalized)) {
      return PaymentSessionStatus.AUTHORIZED
    }

    if (FAILURE_STATUSES.has(normalized)) {
      return PaymentSessionStatus.CANCELED
    }

    return PaymentSessionStatus.PENDING
  }


  async initiatePayment({
    amount,
    currency_code,
    context,
    data,
  }: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const sessionId =
      (data?.session_id as string) ?? context?.idempotency_key ?? `ssl_${crypto.randomUUID()}`

    const normalizedAmount = SSLCommerzPaymentProvider.normalizeAmount(amount, currency_code)

    // Log the raw context to understand what Medusa provides
    this.logger_.info(`[SSLCommerz] Raw context received: ${JSON.stringify(context, null, 2)}`)
    this.logger_.info(`[SSLCommerz] Data received: ${JSON.stringify(data, null, 2)}`)

    // Check if cart data was passed in data parameter (from storefront)
    const cartData = (data as any)?.cart || (context as any)?.cart
    let cartId: string | null = null

    if (cartData) {
      this.logger_.info(`[SSLCommerz] ✅ Cart data found! Cart ID: ${cartData.id}, Email: ${cartData.email}`)
      cartId = cartData.id
    } else {
      this.logger_.warn(`[SSLCommerz] ⚠️ No cart data in context or data - will use defaults`)
    }

    // Extract customer data - use cart data if available, otherwise fallback
    const customerData = cartData 
      ? this.extractCustomerDataFromCart(cartData)
      : this.extractCustomerData(context)

    const callbackOverrides = {
      success_url: this.buildCallbackUrl(process.env.SSL_SUCCESS_URL, sessionId, cartId ?? undefined),
      fail_url: this.buildCallbackUrl(process.env.SSL_FAIL_URL, sessionId, cartId ?? undefined),
      cancel_url: this.buildCallbackUrl(process.env.SSL_CANCEL_URL, sessionId, cartId ?? undefined),
      ipn_url: this.buildCallbackUrl(process.env.SSL_IPN_URL, sessionId, cartId ?? undefined),
    }

    const payload = withDefaultTransactionData({
      tran_id: sessionId,
      total_amount: normalizedAmount,
      currency: currency_code?.toUpperCase() ?? process.env.SSL_CURRENCY ?? "BDT",
      ...customerData,
      ...callbackOverrides,
    })

    this.logger_.info(`[SSLCommerz] Payment payload: ${JSON.stringify(payload, null, 2)}`)

    const client = getSslCommerzClient()
    const response = await client.init(payload)

    console.log("[SSLCommerz] Init response:", JSON.stringify(response, null, 2))

    if (!response?.GatewayPageURL) {
      console.error("[SSLCommerz] Missing GatewayPageURL. Full response:", response)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `SSLCommerz did not return a GatewayPageURL. Response status: ${response?.status || 'unknown'}`
      )
    }

    // Store cart_id in session data for easy retrieval later
    const sessionData: SslCommerzSessionData = {
      tran_id: sessionId,
      gateway_url: response.GatewayPageURL,
      payload,
      provider_response: response,
      cart_id: cartId ?? undefined,
    }

    // Cache session data in Redis for 1 hour (3600 seconds)
    // This ensures we can retrieve cart_id even if context is lost
    try {
      await upstashRedis.set(`ssl:session:${sessionId}`, sessionData, 3600)
      if (cartId) {
        await upstashRedis.set(`ssl:cart:${cartId}`, sessionId, 3600)
      }
      this.logger_.info(`[SSLCommerz] Session ${sessionId} cached in Redis`)
    } catch (error: any) {
      this.logger_.warn(`[SSLCommerz] Failed to cache session in Redis: ${error?.message ?? error}`)
    }

    return {
      id: sessionId,
      status: PaymentSessionStatus.PENDING,
      data: sessionData,
    }
  }

  async authorizePayment({
    data,
  }: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    this.logger_.info(`[SSLCommerz] authorizePayment called with data: ${JSON.stringify(data, null, 2)}`)

    let sessionData = data as SslCommerzSessionData | undefined
    const tranId = sessionData?.tran_id

    if (!tranId) {
      this.logger_.error(`[SSLCommerz] Missing tran_id in session data: ${JSON.stringify(sessionData, null, 2)}`)
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Missing tran_id while authorizing SSLCommerz payment"
      )
    }

    // Try to restore session data from Redis if not fully available
    if (!sessionData?.cart_id) {
      try {
        const cachedData = await upstashRedis.get<SslCommerzSessionData>(`ssl:session:${tranId}`)
        if (cachedData) {
          this.logger_.info(`[SSLCommerz] Restored session data from Redis for ${tranId}`)
          sessionData = { ...sessionData, ...cachedData }
        }
      } catch (error: any) {
        this.logger_.warn(`[SSLCommerz] Failed to restore session from Redis: ${error?.message ?? error}`)
      }
    }

    this.logger_.info(`[SSLCommerz] Querying transaction ${tranId} from SSLCommerz`)
    const validation = await this.queryTransaction(tranId)
    this.logger_.info(`[SSLCommerz] Validation result: ${JSON.stringify(validation, null, 2)}`)

    // Extract status from the response structure
    // SSLCommerz returns: { element: [{ status: "VALIDATED", ... }] }
    const transactionData = validation?.element?.[0]
    const sslStatus = transactionData?.status || validation?.status
    const status = this.mapStatus(sslStatus)
    this.logger_.info(`[SSLCommerz] Mapped status: ${status} (from ${sslStatus})`)

    return {
      status,
      data: {
        ...sessionData,
        last_validation: validation,
        transaction_data: transactionData,
      },
    }
  }

  async capturePayment({
    data,
  }: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return { data }
  }

  async refundPayment({
    data,
    amount,
  }: RefundPaymentInput): Promise<RefundPaymentOutput> {
    try {
      const sessionData = data as SslCommerzSessionData | undefined
      const bankTranId = sessionData?.last_validation?.bank_tran_id as string | undefined

      if (!bankTranId) {
        throw new Error("Missing bank transaction id while refunding")
      }

      const client = getSslCommerzClient()
      await client.initiateRefund({
        bank_tran_id: bankTranId,
        refund_amount: SSLCommerzPaymentProvider.normalizeAmount(amount, "BDT"),
        refund_remarks: "Medusa refund",
      })
    } catch (error: any) {
      this.logger_.warn(
        `Failed to trigger SSLCommerz refund: ${error?.message ?? "unknown error"}`
      )
    }

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
    let sessionData = data as SslCommerzSessionData | undefined
    const tranId = sessionData?.tran_id

    if (!tranId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Missing tran_id while retrieving SSLCommerz payment status"
      )
    }

    // Try to restore session data from Redis if not available
    if (!sessionData?.cart_id) {
      try {
        const cachedData = await upstashRedis.get<SslCommerzSessionData>(`ssl:session:${tranId}`)
        if (cachedData) {
          sessionData = { ...sessionData, ...cachedData }
        }
      } catch (error: any) {
        this.logger_.warn(`[SSLCommerz] Failed to restore session from Redis: ${error?.message ?? error}`)
      }
    }

    const validation = await this.queryTransaction(tranId)
    // Extract status from the response structure
    const transactionData = validation?.element?.[0]
    const sslStatus = transactionData?.status || validation?.status

    return {
      status: this.mapStatus(sslStatus),
      data: {
        ...sessionData,
        last_validation: validation,
      },
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
    const data = payload?.data as Record<string, unknown> | undefined
    const status = typeof data?.status === "string" ? data?.status : undefined
    const sessionId = (data?.tran_id as string | undefined) ?? (data?.session_id as string | undefined)

    if (!sessionId) {
      return {
        action: PaymentActions.NOT_SUPPORTED,
      }
    }

    const mappedStatus = this.mapStatus(status)

    if (mappedStatus === PaymentSessionStatus.AUTHORIZED) {
      return {
        action: PaymentActions.AUTHORIZED,
        data: {
          session_id: sessionId,
          amount: Number(data?.amount ?? 0),
        },
      }
    }

    if (mappedStatus === PaymentSessionStatus.CANCELED) {
      return {
        action: PaymentActions.CANCELED,
        data: {
          session_id: sessionId,
          amount: Number(data?.amount ?? 0),
        },
      }
    }

    return {
      action: PaymentActions.NOT_SUPPORTED,
      data: {
        session_id: sessionId,
        amount: Number(data?.amount ?? 0),
      },
    }
  }

  /**
   * Helper method to retrieve cart ID from Redis by session ID
   * Useful for callback routes and webhooks
   */
  async getCartIdBySessionId(sessionId: string): Promise<string | null> {
    try {
      const cachedData = await upstashRedis.get<SslCommerzSessionData>(`ssl:session:${sessionId}`)
      return cachedData?.cart_id || null
    } catch (error: any) {
      this.logger_.warn(`[SSLCommerz] Failed to retrieve cart ID from Redis: ${error?.message ?? error}`)
      return null
    }
  }

  /**
   * Helper method to clean up Redis cache after successful payment
   */
  async cleanupSession(sessionId: string, cartId?: string): Promise<void> {
    try {
      await upstashRedis.del(`ssl:session:${sessionId}`)
      if (cartId) {
        await upstashRedis.del(`ssl:cart:${cartId}`)
      }
      this.logger_.info(`[SSLCommerz] Cleaned up session ${sessionId} from Redis`)
    } catch (error: any) {
      this.logger_.warn(`[SSLCommerz] Failed to cleanup session from Redis: ${error?.message ?? error}`)
    }
  }
}

