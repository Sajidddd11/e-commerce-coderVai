// ---------------------------------------------------------------------------
// sms.net.bd  –  SMS client
// Provider docs: https://api.sms.net.bd/sendsms
//
// API parameters (POST)
//   api_key   – required
//   msg       – required  (message body)
//   to        – required  (number with country code 880, or standard 01X)
//   sender_id – optional  (approved sender ID)
//   content_id– optional  (approved campaign content ID)
// ---------------------------------------------------------------------------

type SmsNetSendParams = {
  numbers: string[] | string
  message: string
  senderId?: string
}

export type BulkSmsResponse = {
  code: number | null
  success: boolean
  description: string
  raw: string
  data?: Record<string, any> | string
}

export type BulkSmsBalanceResponse = BulkSmsResponse & {
  balance?: number
  validity?: string
}

type SmsNetClientOptions = {
  apiKey: string
  senderId?: string
}

const SMS_API_URL = "https://api.sms.net.bd/sendsms"
const BALANCE_API_URL = "https://api.sms.net.bd/balance"

export class BulkSmsBdClient {
  private readonly apiKey: string
  private readonly senderId?: string

  constructor(options: SmsNetClientOptions) {
    if (!options.apiKey) {
      throw new Error("sms.net.bd API key is missing")
    }
    this.apiKey = options.apiKey
    this.senderId = options.senderId
  }

  /**
   * Send the same message to one or many numbers.
   * For single transactional SMS, only the first number is used.
   */
  async send(params: SmsNetSendParams): Promise<BulkSmsResponse> {
    const numbers = this.normalizeNumbers(params.numbers)

    if (!numbers.length) {
      throw new Error("At least one phone number is required")
    }

    if (!params.message?.trim()) {
      throw new Error("`message` is required")
    }

    // sms.net.bd accepts comma-separated numbers for campaign SMS.
    // For transactional (single), use just the first number.
    const to = numbers.join(",")

    const body = new URLSearchParams({
      api_key: this.apiKey,
      msg: params.message,
      to,
    })

    const senderId = params.senderId || this.senderId
    if (senderId) {
      body.set("sender_id", senderId)
    }

    const response = await fetch(SMS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })

    const text = await response.text()
    return this.parseResponse(text)
  }

  /**
   * Check account balance.
   * sms.net.bd returns: { error: 0, msg: "...", data: { balance: "123.00" } }
   */
  async getBalance(): Promise<BulkSmsBalanceResponse> {
    const url = `${BALANCE_API_URL}?api_key=${encodeURIComponent(this.apiKey)}`
    const response = await fetch(url, { method: "GET" })
    const text = await response.text()
    const parsed = this.parseResponse(text) as BulkSmsBalanceResponse

    if (parsed.data && typeof parsed.data === "object") {
      const bal = Number((parsed.data as any).balance)
      if (!Number.isNaN(bal)) {
        parsed.balance = bal
      }
    }

    return parsed
  }

  private normalizeNumbers(numbers: string[] | string): string[] {
    if (Array.isArray(numbers)) {
      return numbers.map((n) => n.toString().trim()).filter(Boolean)
    }
    if (typeof numbers === "string") {
      return numbers
        .split(/[,|\s]+/)
        .map((n) => n.trim())
        .filter(Boolean)
    }
    return []
  }

  /**
   * sms.net.bd response format:
   *   Success: { "error": 0, "msg": "Request Submitted Successfully", "data": { "batch_id": 12345 } }
   *   Failure: { "error": 420, "msg": "Invalid API Key" }
   */
  private parseResponse(body: string): BulkSmsResponse {
    let data: Record<string, any> | string | undefined
    let code: number | null = null
    let description = body?.trim() || ""
    let success = false

    try {
      const json = JSON.parse(body)
      data = json
      // sms.net.bd uses `error: 0` for success, non-zero for failure
      const errorCode = Number(json?.error ?? json?.code ?? json?.status ?? null)
      code = errorCode
      description = json?.msg || json?.message || json?.response || description
      success = errorCode === 0
    } catch {
      data = body
      const match = body?.match(/(\d{3,4})/)
      code = match ? Number(match[1]) : null
      success = /submitted successfully/i.test(description)
    }

    return { code, success, description, raw: body, data }
  }
}

// ---------------------------------------------------------------------------
// Singleton factory – env vars
//   SMSNETBD_API_KEY   – required
//   SMSNETBD_SENDER_ID – optional
// ---------------------------------------------------------------------------

let singleton: BulkSmsBdClient | undefined

export const getBulkSmsClient = () => {
  if (singleton) return singleton

  const apiKey = process.env.SMSNETBD_API_KEY
  if (!apiKey) {
    throw new Error("SMSNETBD_API_KEY is not configured in the environment")
  }

  singleton = new BulkSmsBdClient({
    apiKey,
    senderId: process.env.SMSNETBD_SENDER_ID,
  })

  return singleton
}
