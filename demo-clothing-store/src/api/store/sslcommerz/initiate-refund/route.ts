import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getSslCommerzClient } from "../../../../lib/sslcommerz"

const parseRefundAmount = (value: any) => {
  const amount = Number(value)
  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("`refund_amount` must be a positive number")
  }

  return amount
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body || {}) as Record<string, any>

    if (!body.bank_tran_id) {
      return res.status(400).json({ message: "`bank_tran_id` is required" })
    }

    if (!body.refund_amount) {
      return res.status(400).json({ message: "`refund_amount` is required" })
    }

    const payload = {
      ...body,
      refund_amount: parseRefundAmount(body.refund_amount),
    }

    const client = getSslCommerzClient()
    const response = await client.initiateRefund(payload)

    return res.json({ response })
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Failed to initiate SSLCommerz refund",
    })
  }
}

