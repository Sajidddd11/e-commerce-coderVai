import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { IPaymentModuleService } from "@medusajs/framework/types"

export const extractSslPayload = (req: MedusaRequest) => {
  const source = req.method === "GET" ? req.query : req.body
  return (source ?? {}) as Record<string, any>
}

export const getTranIdFromPayload = (payload: Record<string, any>) => {
  return (
    payload?.tran_id ||
    payload?.tranId ||
    payload?.session_id ||
    payload?.sessionId ||
    null
  )
}

export const authorizeSslSession = async (
  req: MedusaRequest,
  tranId: string,
  source: string
) => {
  const paymentModule: IPaymentModuleService = req.scope.resolve("paymentModuleService")

  await paymentModule.authorizePaymentSession(tranId, {
    source,
  })
}

export const respondWithRedirect = (
  res: MedusaResponse,
  status: string,
  tranId?: string | null,
  extra?: Record<string, any>
) => {
  const baseUrl = process.env.SSL_RETURN_URL

  if (baseUrl) {
    try {
      const target = new URL(baseUrl)
      target.searchParams.set("ssl_status", status)

      if (tranId) {
        target.searchParams.set("ssl_tran_id", tranId)
      }

      if (extra) {
        Object.entries(extra).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            target.searchParams.set(key, String(value))
          }
        })
      }

      return res.redirect(target.toString())
    } catch {
      // ignore redirect errors and fallback to JSON
    }
  }

  return res.json({
    status,
    tran_id: tranId,
    ...extra,
  })
}

