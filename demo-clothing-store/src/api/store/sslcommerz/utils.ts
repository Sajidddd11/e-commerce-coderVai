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
  let sessionReturnUrl: string | null = null

  if (tranId) {
    try {
      const paymentModule = req.scope.resolve(Modules.PAYMENT)
      const session = await paymentModule.retrievePaymentSession(tranId)
      if (session) {
        const sessionData = session.data as any
        cartId = sessionData?.cart_id || null
        // Mobile apps pass a custom return_url (deep link) when initiating the session
        sessionReturnUrl = sessionData?.return_url || null

        console.log(`[SSLCommerz] Retrieved cart_id from session: ${cartId}`)
        console.log(`[SSLCommerz] return_url from session: ${sessionReturnUrl}`)

        if (!cartId) {
          console.log(`[SSLCommerz] Full session data:`, JSON.stringify(sessionData, null, 2))
          console.log(`[SSLCommerz] Note: cart_id is null. Will rely on frontend cookies/localStorage.`)
        }
      }
    } catch (error) {
      console.error(`[SSLCommerz] Failed to get cart ID:`, error)
    }
  }

  // Prefer session-level return_url (set by mobile), fall back to env (used by web)
  const baseUrl = sessionReturnUrl || process.env.SSL_RETURN_URL || "http://localhost:8000"

  if (baseUrl) {
    try {
      // Build query string params
      const params = new URLSearchParams()
      params.set("ssl_status", status)
      if (tranId) {
        params.set("ssl_tran_id", tranId)
        params.set("session_id", tranId)
      }
      if (cartId) {
        params.set("cart_id", cartId)
      }
      if (extra) {
        Object.entries(extra).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.set(key, String(value))
          }
        })
      }

      const qs = params.toString()

      // For deep-link schemes (e.g. zahan://...), a server-side HTTP 302 redirect
      // does NOT work in Chrome Custom Tabs on Android — the browser can't navigate
      // to custom URL schemes via HTTP redirects. Instead, serve an HTML page that
      // uses window.location to trigger the Android intent and open the app.
      let targetUrl: string
      if (/^https?:\/\//i.test(baseUrl)) {
        const target = new URL(baseUrl)
        target.pathname = "/checkout/sslcommerz-callback"
        params.forEach((value, key) => target.searchParams.set(key, value))
        targetUrl = target.toString()
        console.log(`[SSLCommerz] Redirecting (web) to: ${targetUrl}`)
        return res.redirect(targetUrl)
      } else {
        // Deep link: zahan://payment/sslcommerz?ssl_status=success&...
        const separator = baseUrl.includes("?") ? "&" : "?"
        targetUrl = `${baseUrl}${separator}${qs}`
        console.log(`[SSLCommerz] Redirecting (deep-link HTML) to: ${targetUrl}`)

        // Serve an HTML page that triggers the app via window.location.
        // This works in Chrome Custom Tabs where HTTP 302 → custom scheme is blocked.
        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Payment Complete</title>
  <style>
    body { font-family: sans-serif; display: flex; flex-direction: column;
           align-items: center; justify-content: center; min-height: 100vh;
           margin: 0; background: #f9f9f9; color: #333; text-align: center; padding: 24px; }
    h2 { color: #16a34a; }
    p { color: #555; }
    a { color: #0070f3; }
  </style>
</head>
<body>
  <h2>Payment Successful</h2>
  <p>Redirecting you back to the app…</p>
  <p>If you are not redirected, <a href="${targetUrl}">tap here</a>.</p>
  <script>
    // Try to open the app via deep link
    window.location.replace("${targetUrl}");
    // Fallback: try after a short delay in case the first attempt is blocked
    setTimeout(function() {
      window.location.href = "${targetUrl}";
    }, 500);
  </script>
</body>
</html>`

        res.setHeader("Content-Type", "text/html; charset=utf-8")
        return res.status(200).send(html)
      }

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

