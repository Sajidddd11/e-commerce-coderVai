import { defineMiddlewares, authenticate } from "@medusajs/framework/http"
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"
import { enrichPaymentContext } from "./middlewares/enrich-payment-context"
import { blockIfEditor } from "./middlewares/block-if-editor"
import { auditDeleteLog } from "./middlewares/audit-log"

/**
 * Middleware to add publishable API key to SSLCommerz callback requests
 * SSLCommerz makes server-to-server requests without the publishable key,
 * so we need to add it automatically for these routes.
 */
async function addPublishableKeyForSslCallbacks(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  // Get publishable key from environment
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  if (!publishableKey) {
    console.error("[SSLCommerz Middleware] Publishable key not found in environment")
    return next()
  }

  // Log that middleware is running
  console.log(`[SSLCommerz Middleware] Adding publishable key to ${req.url}`)

  // If the request doesn't have the publishable key header, add it
  // This must happen BEFORE Medusa's validation middleware runs
  if (!req.headers["x-publishable-api-key"]) {
    req.headers["x-publishable-api-key"] = publishableKey
    console.log(`[SSLCommerz Middleware] Added publishable key header`)
  } else {
    console.log(`[SSLCommerz Middleware] Publishable key already present`)
  }

  // Also try setting it directly on the request object
  ; (req as any).headers = req.headers || {}
    ; (req as any).headers["x-publishable-api-key"] = publishableKey

  // Set in rawHeaders if available
  if ((req as any).rawHeaders) {
    const rawHeaders = (req as any).rawHeaders as string[]
    const keyIndex = rawHeaders.findIndex(
      (h: string) => h.toLowerCase() === "x-publishable-api-key"
    )
    if (keyIndex === -1) {
      rawHeaders.push("x-publishable-api-key", publishableKey)
    } else if (keyIndex >= 0 && keyIndex < rawHeaders.length - 1) {
      rawHeaders[keyIndex + 1] = publishableKey
    }
  }

  next()
}

export default defineMiddlewares({
  routes: [
    // Enrich payment session creation with cart data
    {
      matcher: /^\/store\/payment-collections\/[^\/]+\/payment-sessions$/,
      middlewares: [enrichPaymentContext],
    },
    // Add publishable key for SSLCommerz callbacks
    {
      matcher: /^\/store\/sslcommerz\/(success|fail|cancel|ipn)/,
      middlewares: [addPublishableKeyForSslCallbacks],
    },
    // ─── Recommendation Engine: public store endpoints (no auth needed) ──────
    // POST /store/track — event ingestion (guests + logged-in users)
    {
      matcher: "/store/track",
      method: ["POST"],
      middlewares: [],
    },
    // GET /store/recommendations — returns product suggestions
    {
      matcher: "/store/recommendations",
      method: ["GET"],
      middlewares: [],
    },
    // ─── File size limit: reject uploads > 500 KB ──────────────────────────
    {
      matcher: "/admin/uploads",
      method: ["POST"],
      middlewares: [
        (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          const contentLength = parseInt(req.headers["content-length"] || "0", 10)
          // 500 KB + some overhead for multipart form boundaries
          if (contentLength > 600 * 1024) {
            return res.status(413).json({
              message: "File size exceeds the 500 KB limit. Please compress the image before uploading.",
              type: "invalid_data",
            })
          }
          next()
        },
      ],
    },
    // ─── RBAC: Block restricted actions for editor-role users ──────────────
    // ─── Audit: Log all successful DELETE requests ──────────────────────────
    {
      matcher: "/admin",
      middlewares: [
        authenticate("user", ["session", "bearer"]),
        blockIfEditor,
        auditDeleteLog,
      ],
    },
  ],
})
