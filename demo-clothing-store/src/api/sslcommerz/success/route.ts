import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  authorizeSslSession,
  respondWithRedirect,
} from "../../store/sslcommerz/utils"

const handleCallback = async (req: MedusaRequest, res: MedusaResponse) => {
  // Get session_id from query params (we add it to callback URLs)
  const sessionId = (req.query?.session_id as string) || null
  
  if (!sessionId) {
    return res.status(400).json({
      message: "Missing session_id in callback URL",
    })
  }

  let paymentCollectionId: string | null = null
  try {
    const result = await authorizeSslSession(req, sessionId, "success")
    paymentCollectionId = result?.payment_collection_id || null
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Failed to authorize SSLCommerz session",
      session_id: sessionId,
    })
  }

  return await respondWithRedirect(req, res, "success", sessionId, paymentCollectionId)
}

export const POST = (req: MedusaRequest, res: MedusaResponse) => handleCallback(req, res)

export const GET = (req: MedusaRequest, res: MedusaResponse) => handleCallback(req, res)

