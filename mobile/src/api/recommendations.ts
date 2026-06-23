/**
 * Recommendations API — mobile client for the recommendation engine.
 *
 * Wraps the two backend endpoints:
 *   POST /store/track       — record a behaviour event
 *   GET  /store/recommendations — fetch suggested products
 */

import { HttpTypes } from "@medusajs/types"
import { MEDUSA_BACKEND, PUBLISHABLE_KEY } from "./sdk"
import { getIdentity } from "@utils/device-id"

// ─── Types ────────────────────────────────────────────────────────────────────

export type TrackEventInput = {
    event_type:     "detail_view" | "cart_addition" | "purchase" | "rating"
    product_id:     string
    customer_id?:   string
    category_id?:   string
    collection_id?: string
    amount?:        number
    price?:         number
    rating?:        number
    recomm_id?:     string
}

export type RecommendationsParams = {
    type?:       "auto" | "personalised" | "trending" | "bought_together"
    product_id?: string
    customer_id?: string
    region_id?:  string
    limit?:      number
}

export type RecommendationsResponse = {
    products:  HttpTypes.StoreProduct[]
    strategy:  string
    recomm_id: string
    count:     number
}

// ─── Track a behaviour event ──────────────────────────────────────────────────

/**
 * Fire-and-forget event tracking.
 * Never throws — tracking must never crash the app.
 *
 * Call this:
 *   - On product screen mount  → detail_view
 *   - On "Add to Cart" press   → cart_addition
 *   - On order success         → purchase (or use the server-side subscriber)
 *   - On review submit         → rating
 */
export async function trackEvent(input: TrackEventInput): Promise<void> {
    try {
        const identity = await getIdentity()

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        }
        if (PUBLISHABLE_KEY) {
            headers["x-publishable-api-key"] = PUBLISHABLE_KEY
        }

        fetch(`${MEDUSA_BACKEND}/store/track`, {
            method:  "POST",
            headers,
            body: JSON.stringify({
                ...input,
                session_id:     identity.session_id,
                fingerprint_id: identity.fingerprint_id,
            }),
        }).catch(() => {
            // Silently ignore — tracking must never affect UX
        })
    } catch {
        // Silently ignore
    }
}

// ─── Fetch recommendations ────────────────────────────────────────────────────

/**
 * Fetches personalised product recommendations.
 *
 * The backend automatically picks the best strategy:
 *   - personalised  → if the user has 5+ behaviour events
 *   - mixed         → if 1–4 events
 *   - trending      → if no events (new/anonymous user)
 *
 * Pass product_id to get "frequently bought together" suggestions.
 */
export async function getRecommendations(
    params: RecommendationsParams = {}
): Promise<RecommendationsResponse> {
    const identity = await getIdentity()

    const query = new URLSearchParams({
        session_id:     identity.session_id,
        fingerprint_id: identity.fingerprint_id,
        type:           params.type    ?? "auto",
        limit:          String(params.limit ?? 10),
    })

    if (params.customer_id) query.set("customer_id", params.customer_id)
    if (params.product_id)  query.set("product_id",  params.product_id)
    if (params.region_id)   query.set("region_id",   params.region_id)

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    }
    if (PUBLISHABLE_KEY) {
        headers["x-publishable-api-key"] = PUBLISHABLE_KEY
    }

    const res = await fetch(
        `${MEDUSA_BACKEND}/store/recommendations?${query.toString()}`,
        { headers }
    )

    if (!res.ok) {
        throw new Error(`[Recommendations] HTTP ${res.status}`)
    }

    return res.json() as Promise<RecommendationsResponse>
}

// ─── Merge guest history to customer on login ────────────────────────────────

/**
 * Fire-and-forget merge: links all guest behaviour events (session_id +
 * fingerprint_id) to the now-authenticated customer_id.
 * Call this immediately after login or signup.
 */
export async function mergeGuestHistory(customerId: string): Promise<void> {
    try {
        const identity = await getIdentity()

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        }
        if (PUBLISHABLE_KEY) {
            headers["x-publishable-api-key"] = PUBLISHABLE_KEY
        }

        fetch(`${MEDUSA_BACKEND}/store/recommendations/merge`, {
            method:  "POST",
            headers,
            body: JSON.stringify({
                customer_id:    customerId,
                session_id:     identity.session_id,
                fingerprint_id: identity.fingerprint_id,
            }),
        }).catch(() => {
            // Silently ignore — merge must never affect UX
        })
    } catch {
        // Silently ignore
    }
}
