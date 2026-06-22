import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { RECOMMENDATION_MODULE } from "../../../modules/recommendation"
import type RecommendationModuleService from "../../../modules/recommendation/service"

/**
 * POST /store/track
 *
 * Lightweight fire-and-forget event ingestion endpoint.
 * Saves a single user behaviour event to behaviour_event table.
 *
 * All field names match Recombee's API so data can be forwarded any time.
 *
 * Body:
 *   event_type      'detail_view' | 'cart_addition' | 'purchase' | 'rating'
 *   product_id      string (required)
 *   session_id      string (required — always present, even for logged-in users)
 *   customer_id?    string (from Medusa auth, optional)
 *   fingerprint_id? string (from FingerprintJS on web / device-info on mobile)
 *   category_id?    string (denormalized for fast grouping)
 *   collection_id?  string
 *   amount?         number (quantity for cart/purchase events)
 *   price?          number (unit price for cart/purchase events)
 *   rating?         number (1-5 for rating events)
 *   recomm_id?      string (ID from a previous /recommendations response — tracks clicks)
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const body = req.body as any

        const {
            event_type,
            product_id,
            session_id,
            customer_id,
            fingerprint_id,
            category_id,
            collection_id,
            amount,
            price,
            rating,
            recomm_id,
        } = body

        // ── Validation ────────────────────────────────────────────────────────
        if (!event_type || !product_id || !session_id) {
            return res.status(400).json({
                message: "event_type, product_id and session_id are required",
            })
        }

        const validEvents = ["detail_view", "cart_addition", "purchase", "rating"]
        if (!validEvents.includes(event_type)) {
            return res.status(400).json({
                message: `event_type must be one of: ${validEvents.join(", ")}`,
            })
        }

        const recommendationService: RecommendationModuleService =
            req.scope.resolve(RECOMMENDATION_MODULE)

        // ── Track the event (non-blocking response) ───────────────────────────
        // We respond immediately and let the DB write happen asynchronously
        // so the UI is never blocked by tracking.
        recommendationService.trackEvent({
            event_type,
            product_id,
            session_id,
            customer_id:    customer_id    ?? undefined,
            fingerprint_id: fingerprint_id ?? undefined,
            category_id:    category_id    ?? undefined,
            collection_id:  collection_id  ?? undefined,
            amount:         amount         ?? undefined,
            price:          price          ?? undefined,
            rating:         rating         ?? undefined,
            recomm_id:      recomm_id      ?? undefined,
        }).catch(err => {
            // Never crash the response over a tracking failure
            console.error("[Track] ⚠️ Failed to save event:", err?.message)
        })

        return res.status(200).json({ ok: true })
    } catch (error: any) {
        console.error("[Track] ❌ Error:", error)
        return res.status(500).json({ message: error?.message ?? "Tracking failed" })
    }
}
