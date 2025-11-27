import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  authorizeSslSession,
  extractSslPayload,
  getTranIdFromPayload,
  respondWithRedirect,
} from "../utils"

const handleCallback = async (req: MedusaRequest, res: MedusaResponse) => {
  // Add publishable key for SSLCommerz callbacks (they don't send it)
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (publishableKey && !req.headers["x-publishable-api-key"]) {
    req.headers["x-publishable-api-key"] = publishableKey
  }
  const payload = extractSslPayload(req)
  const tranId = getTranIdFromPayload(payload)

  if (!tranId) {
    return res.status(400).json({
      message: "Unable to determine SSLCommerz transaction id",
    })
  }

  try {
    await authorizeSslSession(req, tranId, "success")
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Failed to authorize SSLCommerz session",
      tran_id: tranId,
    })
  }

  return await respondWithRedirect(req, res, "success", tranId, null)
}

export const POST = (req: MedusaRequest, res: MedusaResponse) => handleCallback(req, res)

export const GET = (req: MedusaRequest, res: MedusaResponse) => handleCallback(req, res)

