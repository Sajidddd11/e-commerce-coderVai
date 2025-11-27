import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getSslCommerzClient } from "../../../../lib/sslcommerz"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body || {}) as Record<string, any>
    const sessionKey = body.sessionkey

    if (!sessionKey) {
      return res
        .status(400)
        .json({ message: "`sessionkey` is required to query a transaction" })
    }

    const client = getSslCommerzClient()
    const response = await client.transactionQueryBySessionId({
      sessionkey: sessionKey,
    })

    return res.json({ response })
  } catch (error: any) {
    return res.status(500).json({
      message:
        error?.message || "Failed to query SSLCommerz transaction by session",
    })
  }
}

