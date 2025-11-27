import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getSslCommerzClient } from "../../../../lib/sslcommerz"

const extractValId = (req: MedusaRequest) => {
  return (
    (req.body && (req.body as Record<string, any>).val_id) ||
    (req.query && (req.query as Record<string, any>).val_id)
  )
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const valId = extractValId(req)

    if (!valId) {
      return res.status(400).json({ message: "`val_id` is required" })
    }

    const client = getSslCommerzClient()
    const response = await client.validate({ val_id: valId })

    return res.json({ response })
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Failed to validate SSLCommerz transaction",
    })
  }
}

