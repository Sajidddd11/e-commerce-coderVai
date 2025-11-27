type BulkSmsSendParams = {
  numbers: string[] | string
  message: string
  senderId?: string
  type?: string
}

type BulkSmsManyParams = {
  payload: { number: string; message: string }[]
  senderId?: string
  type?: string
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

type BulkSmsClientOptions = {
  apiKey: string
  senderId: string
  apiUrl?: string
  balanceUrl?: string
  defaultType?: string
}

const DEFAULT_SMS_API_URL = process.env.BULKSMSBD_API_URL || "http://bulksmsbd.net/api/smsapi"
const DEFAULT_BALANCE_URL =
  process.env.BULKSMSBD_BALANCE_URL || "http://bulksmsbd.net/api/getBalanceApi"

export class BulkSmsBdClient {
  private readonly config: Required<BulkSmsClientOptions>

  constructor(options: BulkSmsClientOptions) {
    if (!options.apiKey) {
      throw new Error("Bulk SMS BD API key is missing")
    }

    if (!options.senderId) {
      throw new Error("Bulk SMS BD sender ID is missing")
    }

    this.config = {
      apiKey: options.apiKey,
      senderId: options.senderId,
      apiUrl: options.apiUrl || DEFAULT_SMS_API_URL,
      balanceUrl: options.balanceUrl || DEFAULT_BALANCE_URL,
      defaultType: options.defaultType || process.env.BULKSMSBD_DEFAULT_TYPE || "text",
    }
  }

  /**
   * Send the same message to one or many numbers (comma separated under the hood)
   */
  async send(params: BulkSmsSendParams): Promise<BulkSmsResponse> {
    const numbers = this.normalizeNumbers(params.numbers)

    if (!numbers.length) {
      throw new Error("At least one phone number is required")
    }

    if (!params.message?.trim()) {
      throw new Error("`message` is required")
    }

    const search = new URLSearchParams({
      api_key: this.config.apiKey,
      type: params.type || this.config.defaultType,
      senderid: params.senderId || this.config.senderId,
      number: numbers.join(","),
      message: params.message,
    })

    const url = `${this.config.apiUrl}?${search.toString()}`

    const response = await fetch(url, {
      method: "POST",
    })

    const body = await response.text()

    return this.parseResponse(body)
  }

  /**
   * Send different messages to different recipients (Bulk SMS BD "messages" parameter)
   */
  async sendCustomized(params: BulkSmsManyParams): Promise<BulkSmsResponse> {
    if (!params.payload?.length) {
      throw new Error("`payload` must include at least one message entry")
    }

    const formatted = params.payload
      .filter((entry) => entry.number && entry.message)
      .map((entry) => `${entry.number}##${entry.message}`)

    if (!formatted.length) {
      throw new Error("`payload` must contain valid numbers and messages")
    }

    const search = new URLSearchParams({
      api_key: this.config.apiKey,
      type: params.type || this.config.defaultType,
      senderid: params.senderId || this.config.senderId,
      messages: formatted.join("||"),
    })

    const url = `${this.config.apiUrl}?${search.toString()}`

    const response = await fetch(url, {
      method: "POST",
    })

    const body = await response.text()
    return this.parseResponse(body)
  }

  async getBalance(): Promise<BulkSmsBalanceResponse> {
    const search = new URLSearchParams({
      api_key: this.config.apiKey,
    })

    const url = `${this.config.balanceUrl}?${search.toString()}`
    const response = await fetch(url, { method: "GET" })
    const body = await response.text()
    const parsed = this.parseResponse(body) as BulkSmsBalanceResponse

    // Simple heuristics: API often returns `{"current_balance":"123.00","validity":"2025-12-01"}`
    if (parsed.data && typeof parsed.data === "object") {
      const balance = Number((parsed.data as any).current_balance)
      if (!Number.isNaN(balance)) {
        parsed.balance = balance
      }
      const validity = (parsed.data as any).validity
      if (validity) {
        parsed.validity = validity
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

  private parseResponse(body: string): BulkSmsResponse {
    let data: Record<string, any> | string | undefined
    let code: number | null = null
    let description = body?.trim() || ""

    try {
      const json = JSON.parse(body)
      data = json
      code = Number(json?.response_code ?? json?.code ?? json?.status)
      description =
        json?.message || json?.response_description || json?.response || description
    } catch {
      data = body
      const match = body?.match(/(\d{3,4})/)
      code = match ? Number(match[1]) : null
    }

    const success = code === 202 || /Submitted Successfully/i.test(description)

    return {
      code,
      success,
      description,
      raw: body,
      data,
    }
  }
}

let singleton: BulkSmsBdClient | undefined

export const getBulkSmsClient = () => {
  if (singleton) {
    return singleton
  }

  const apiKey = process.env.BULKSMSBD_API_KEY
  const senderId = process.env.BULKSMSBD_SENDER_ID

  if (!apiKey || !senderId) {
    throw new Error("Bulk SMS BD credentials are not configured in the environment")
  }

  singleton = new BulkSmsBdClient({
    apiKey,
    senderId,
    apiUrl: process.env.BULKSMSBD_API_URL,
    balanceUrl: process.env.BULKSMSBD_BALANCE_URL,
    defaultType: process.env.BULKSMSBD_DEFAULT_TYPE,
  })

  return singleton
}

