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

  constructor({ logger }: InjectedDependencies, options: Record<string, unknown>) {
    super({ logger }, options)
    this.logger_ = logger
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

  protected extractCustomerData(context: InitiatePaymentInput["context"]) {
    // Log the entire context for debugging
    this.logger_.info(`[SSLCommerz] Extracting customer data from context: ${JSON.stringify(context, null, 2)}`)

    const customer = context?.customer
    const address = customer?.billing_address

    // Extract phone number with multiple fallbacks
    // Medusa v2 might store phone in different places
    let phoneNumber =
      customer?.phone ||
      (customer as any)?.metadata?.phone ||
      address?.phone ||
      (address as any)?.phone_number ||
      (context as any)?.billing_address?.phone ||
      (context as any)?.shipping_address?.phone ||
      "01700000000" // Default valid BD phone format

    // Ensure phone is a non-empty string
    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
      phoneNumber = "01700000000"
    }

    const fullName =
      `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`.trim() ||
      customer?.company_name ||
      "Customer"

    const customerData = {
      cus_name: fullName,
      cus_email: customer?.email ?? "no-reply@example.com",
      cus_add1: address?.address_1 ?? "Address Line 1",
      cus_add2: address?.address_2 ?? "",
      cus_city: address?.city ?? "City",
      cus_state: address?.province ?? "State",
      cus_postcode: address?.postal_code ?? "0000",
      cus_country: address?.country_code
        ? address.country_code.toUpperCase()
        : "BD",
      cus_phone: phoneNumber,
      ship_name: fullName,
      ship_add1: address?.address_1 ?? "Address Line 1",
      ship_add2: address?.address_2 ?? "",
      ship_city: address?.city ?? "City",
      ship_state: address?.province ?? "State",
      ship_postcode: address?.postal_code ?? "0000",
      ship_country: address?.country_code
        ? address.country_code.toUpperCase()
        : "BD",
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

    const customerData = this.extractCustomerData(context)

    // Try to get cart ID early so we can include it in callback URLs
    const cartId = (context as any)?.cart_id || (context as any)?.cart?.id || null

    const callbackOverrides = {
      success_url: this.buildCallbackUrl(process.env.SSL_SUCCESS_URL, sessionId, cartId),
      fail_url: this.buildCallbackUrl(process.env.SSL_FAIL_URL, sessionId, cartId),
      cancel_url: this.buildCallbackUrl(process.env.SSL_CANCEL_URL, sessionId, cartId),
      ipn_url: this.buildCallbackUrl(process.env.SSL_IPN_URL, sessionId, cartId),
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
      cart_id: cartId,
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

    const sessionData = data as SslCommerzSessionData | undefined
    const tranId = sessionData?.tran_id

    if (!tranId) {
      this.logger_.error(`[SSLCommerz] Missing tran_id in session data: ${JSON.stringify(sessionData, null, 2)}`)
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Missing tran_id while authorizing SSLCommerz payment"
      )
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
    const sessionData = data as SslCommerzSessionData | undefined
    const tranId = sessionData?.tran_id

    if (!tranId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Missing tran_id while retrieving SSLCommerz payment status"
      )
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
}

