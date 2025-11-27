import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getSslCommerzClient } from "../../../../lib/sslcommerz"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const body = (req.body || {}) as Record<string, any>
    const refundRefId = body.refund_ref_id

    if (!refundRefId) {
      return res.status(400).json({ message: "`refund_ref_id` is required" })
    }

    const client = getSslCommerzClient()
    const response = await client.refundQuery({ refund_ref_id: refundRefId })

    return res.json({ response })
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Failed to query SSLCommerz refund",
    })
  }
}

