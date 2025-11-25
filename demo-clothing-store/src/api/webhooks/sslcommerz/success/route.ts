import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  authorizeSslSession,
  extractSslPayload,
  getTranIdFromPayload,
  respondWithRedirect,
} from "../utils"

const handleCallback = async (req: MedusaRequest, res: MedusaResponse) => {
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

  return respondWithRedirect(res, "success", tranId)
}

export const POST = (req: MedusaRequest, res: MedusaResponse) => handleCallback(req, res)

export const GET = (req: MedusaRequest, res: MedusaResponse) => handleCallback(req, res)

