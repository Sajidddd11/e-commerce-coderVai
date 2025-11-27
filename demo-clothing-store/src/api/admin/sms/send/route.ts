import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getBulkSmsClient } from "../../../../lib/sms/bulk-sms-bd"

type SendSmsBody = {
  numbers: string[] | string
  message: string
  senderId?: string
  type?: string
}

const normalizeBody = (body: Record<string, any>): SendSmsBody => {
  return {
    numbers: body.numbers ?? body.number ?? [],
    message: body.message,
    senderId: body.senderId ?? body.senderid,
    type: body.type,
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = normalizeBody((req.body || {}) as Record<string, any>)
    const client = getBulkSmsClient()

    if (!body.message?.trim()) {
      return res.status(400).json({ message: "`message` is required" })
    }

    const numbers = Array.isArray(body.numbers)
      ? body.numbers
      : typeof body.numbers === "string"
        ? body.numbers.split(/[,|\s]+/).filter(Boolean)
        : []

    if (!numbers.length) {
      return res.status(400).json({ message: "`numbers` must include at least one recipient" })
    }

    const response = await client.send({
      numbers,
      message: body.message,
      senderId: body.senderId,
      type: body.type,
    })

    const statusCode = response.success ? 200 : 502

    return res.status(statusCode).json({
      message: response.description,
      code: response.code,
      success: response.success,
      raw: response.raw,
      data: response.data,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message ?? "Failed to send SMS via Bulk SMS BD",
    })
  }
}

