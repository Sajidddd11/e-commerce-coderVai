import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getSslCommerzClient } from "../../../lib/sslcommerz"

export const extractSslPayload = (req: MedusaRequest) => {
  const source = req.method === "GET" ? req.query : req.body
  return (source ?? {}) as Record<string, any>
}

export const getTranIdFromPayload = (payload: Record<string, any>) => {
  // SSLCommerz sends tran_id in the payload
  // But we also need to check for session_id from query params (added by our callback URLs)
  return (
    payload?.tran_id ||
    payload?.tranId ||
    payload?.session_id ||
    payload?.sessionId ||
    null
  )
}

export const getSessionIdFromRequest = (req: MedusaRequest): string | null => {
  // Check query params first (we add session_id to callback URLs)
  const querySessionId = req.query?.session_id as string | undefined
  if (querySessionId) {
    return querySessionId
  }

  // Fallback to payload
  const payload = extractSslPayload(req)
  return getTranIdFromPayload(payload)
}

export const authorizeSslSession = async (
  req: MedusaRequest,
  sessionId: string,
  source: string
) => {
  const paymentModule = req.scope.resolve(Modules.PAYMENT)

  // Retrieve the payment session to verify it exists and get its data
  const session = await paymentModule.retrievePaymentSession(sessionId)

  if (!session) {
    throw new Error(`Payment session ${sessionId} not found`)
  }

  // Verify the session is associated with SSLCommerz provider
  if (!session.provider_id || !session.provider_id.includes("sslcommerz")) {
    throw new Error(
      `Payment session ${sessionId} is not associated with SSLCommerz provider. Found: ${session.provider_id}`
    )
  }

  // Log session data for debugging
  console.log(`[SSLCommerz] Authorizing session ${sessionId}`)
  console.log(`[SSLCommerz] Provider ID: ${session.provider_id}`)
  console.log(`[SSLCommerz] Session data:`, JSON.stringify(session.data, null, 2))

  // Get the tran_id from session data
  const sessionData = session.data as any
  const sslTranId = sessionData?.tran_id || sessionId

  // Validate with SSLCommerz first
  const client = getSslCommerzClient()
  let validation: any
  try {
    console.log(`[SSLCommerz] Querying transaction ${sslTranId} from SSLCommerz`)
    validation = await client.transactionQueryByTransactionId({
      tran_id: sslTranId,
    })
    console.log(`[SSLCommerz] Validation result:`, JSON.stringify(validation, null, 2))
  } catch (error: any) {
    console.error(`[SSLCommerz] Failed to query transaction ${sslTranId}:`, error.message)
    throw new Error(`Failed to validate SSLCommerz transaction: ${error.message}`)
  }

  // Authorize the session - this will call the provider's authorizePayment method
  // The provider will use the session data which should include tran_id
  try {
    await paymentModule.authorizePaymentSession(sessionId, {
      source,
    })
    console.log(`[SSLCommerz] Successfully authorized session ${sessionId}`)
  } catch (error: any) {
    console.error(`[SSLCommerz] Failed to authorize session ${sessionId}:`, error.message)
    throw error
  }

  // Return the payment collection ID so we can redirect to the frontend with cart info
  return {
    payment_collection_id: session.payment_collection_id,
  }
}

export const respondWithRedirect = async (
  req: MedusaRequest,
  res: MedusaResponse,
  status: string,
  tranId?: string | null,
  paymentCollectionId?: string | null,
  extra?: Record<string, any>
) => {
  // Get cart ID from payment session data or payment collection
  let cartId: string | null = null
  if (tranId) {
    try {
      const paymentModule = req.scope.resolve(Modules.PAYMENT)
      const session = await paymentModule.retrievePaymentSession(tranId)
      if (session) {
        const sessionData = session.data as any
        cartId = sessionData?.cart_id || null
        console.log(`[SSLCommerz] Retrieved cart_id from session: ${cartId}`)

        // If cart_id is null, log the full session data for debugging
        if (!cartId) {
          console.log(`[SSLCommerz] Full session data:`, JSON.stringify(sessionData, null, 2))
          console.log(`[SSLCommerz] Note: cart_id is null. Will rely on frontend cookies/localStorage.`)
        }
      }
    } catch (error) {
      console.error(`[SSLCommerz] Failed to get cart ID:`, error)
    }
  }

  const baseUrl = process.env.SSL_RETURN_URL || "http://localhost:8000"

  if (baseUrl) {
    try {
      const target = new URL(baseUrl)
      target.pathname = "/checkout/sslcommerz-callback"
      target.searchParams.set("ssl_status", status)

      if (tranId) {
        target.searchParams.set("ssl_tran_id", tranId)
        target.searchParams.set("session_id", tranId)
      }

      // Pass cart_id if we have it
      if (cartId) {
        target.searchParams.set("cart_id", cartId)
      }

      if (extra) {
        Object.entries(extra).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            target.searchParams.set(key, String(value))
          }
        })
      }

      return res.redirect(target.toString())
    } catch (error) {
      console.error(`[SSLCommerz] Failed to redirect:`, error)
      // fallback to JSON
    }
  }

  return res.json({
    status,
    tran_id: tranId,
    cart_id: cartId,
    ...extra,
  })
}

