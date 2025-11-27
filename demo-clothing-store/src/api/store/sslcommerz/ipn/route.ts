import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  authorizeSslSession,
  extractSslPayload,
  getTranIdFromPayload,
} from "../utils"

const handleIpn = async (req: MedusaRequest, res: MedusaResponse) => {
  // Add publishable key for SSLCommerz IPN callbacks (they don't send it)
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (publishableKey && !req.headers["x-publishable-api-key"]) {
    req.headers["x-publishable-api-key"] = publishableKey
  }
  const payload = extractSslPayload(req)
  const tranId = getTranIdFromPayload(payload)

  if (!tranId) {
    return res.status(400).json({
      message: "Missing tran_id in IPN payload",
      payload,
    })
  }

  try {
    await authorizeSslSession(req, tranId, "ipn")
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Failed to authorize payment from IPN",
      tran_id: tranId,
    })
  }

  return res.json({
    status: "ipn_received",
    tran_id: tranId,
  })
}

export const POST = (req: MedusaRequest, res: MedusaResponse) => handleIpn(req, res)

