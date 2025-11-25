import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  extractSslPayload,
  getTranIdFromPayload,
  respondWithRedirect,
} from "../../store/sslcommerz/utils"

const respond = async (req: MedusaRequest, res: MedusaResponse) => {
  const sessionId = (req.query?.session_id as string) || null
  return await respondWithRedirect(req, res, "failed", sessionId, null)
}

export const POST = (req: MedusaRequest, res: MedusaResponse) => respond(req, res)

export const GET = (req: MedusaRequest, res: MedusaResponse) => respond(req, res)

