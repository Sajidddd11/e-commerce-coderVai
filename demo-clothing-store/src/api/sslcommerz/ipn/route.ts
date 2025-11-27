import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  authorizeSslSession,
  extractSslPayload,
  getTranIdFromPayload,
} from "../../store/sslcommerz/utils"

const handleIpn = async (req: MedusaRequest, res: MedusaResponse) => {
  // For IPN, we need to get session_id from query params or extract from payload
  const sessionId = (req.query?.session_id as string) || null
  
  if (!sessionId) {
    // Try to get from payload as fallback
    const payload = extractSslPayload(req)
    const tranId = getTranIdFromPayload(payload)
    
    if (!tranId) {
      return res.status(400).json({
        message: "Missing session_id or tran_id in IPN request",
        payload,
      })
    }
    
    // Use tran_id as session_id (they should be the same)
    // IPN should only authorize, not complete the order (that's done by success callback)
    try {
      await authorizeSslSession(req, tranId, "ipn")
    } catch (error: any) {
      // Log error but don't fail - IPN is just a notification
      console.error(`[SSLCommerz] IPN authorization error:`, error)
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

  try {
    // IPN should only authorize, not complete the order
    await authorizeSslSession(req, sessionId, "ipn")
  } catch (error: any) {
    // Log error but don't fail - IPN is just a notification
    console.error(`[SSLCommerz] IPN authorization error:`, error)
    return res.status(500).json({
      message: error?.message || "Failed to authorize payment from IPN",
      session_id: sessionId,
    })
  }

  return res.json({
    status: "ipn_received",
    session_id: sessionId,
  })
}

export const POST = (req: MedusaRequest, res: MedusaResponse) => handleIpn(req, res)

