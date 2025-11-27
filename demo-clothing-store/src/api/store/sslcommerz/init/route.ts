import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  getSslCommerzClient,
  withDefaultTransactionData,
} from "../../../../lib/sslcommerz"

const parseAmount = (value: any) => {
  const amount = Number(value)
  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("`total_amount` must be a positive number")
  }

  return amount
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body || {}) as Record<string, any>

    if (!body.tran_id) {
      return res.status(400).json({ message: "`tran_id` is required" })
    }

    if (!body.total_amount) {
      return res.status(400).json({ message: "`total_amount` is required" })
    }

    const payload = withDefaultTransactionData({
      ...body,
      total_amount: parseAmount(body.total_amount),
    })

    const client = getSslCommerzClient()
    const response = await client.init(payload)

    if (!response?.GatewayPageURL) {
      return res.status(502).json({
        message: "SSLCommerz did not return a gateway URL",
        response,
      })
    }

    return res.json({
      gateway_url: response.GatewayPageURL,
      response,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Failed to initialize SSLCommerz payment",
    })
  }
}

