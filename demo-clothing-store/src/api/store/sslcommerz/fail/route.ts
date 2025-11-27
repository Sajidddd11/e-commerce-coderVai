import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  extractSslPayload,
  getTranIdFromPayload,
  respondWithRedirect,
} from "../utils"

const respond = async (req: MedusaRequest, res: MedusaResponse) => {
  // Add publishable key for SSLCommerz callbacks (they don't send it)
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (publishableKey && !req.headers["x-publishable-api-key"]) {
    req.headers["x-publishable-api-key"] = publishableKey
  }

  const payload = extractSslPayload(req)
  const tranId = getTranIdFromPayload(payload)

  return await respondWithRedirect(req, res, "failed", tranId, null)
}

export const POST = (req: MedusaRequest, res: MedusaResponse) => respond(req, res)

export const GET = (req: MedusaRequest, res: MedusaResponse) => respond(req, res)

