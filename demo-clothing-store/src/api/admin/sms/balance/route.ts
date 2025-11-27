import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getBulkSmsClient } from "../../../../lib/sms/bulk-sms-bd"

export const GET = async (_req: MedusaRequest, res: MedusaResponse) => {
  try {
    const client = getBulkSmsClient()
    const response = await client.getBalance()

    const statusCode = response.success ? 200 : 502

    return res.status(statusCode).json({
      message: response.description,
      code: response.code,
      success: response.success,
      balance: response.balance,
      validity: response.validity,
      raw: response.raw,
      data: response.data,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message ?? "Failed to fetch Bulk SMS BD balance",
    })
  }
}

