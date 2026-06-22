/**
 * RecombeeAdapter — future-ready integration layer.
 *
 * This adapter is DISABLED by default (ENABLE_RECOMBEE=false in .env).
 * When you're ready to switch to Recombee:
 *
 *   1. Sign up at https://recombee.com and get your Database ID + Private Token
 *   2. Add to .env:
 *        ENABLE_RECOMBEE=true
 *        RECOMBEE_DB_ID=your-database-id
 *        RECOMBEE_PRIVATE_TOKEN=your-private-token
 *   3. Run the one-time catalog sync:  node scripts/sync-recombee-catalog.js
 *   4. Run the one-time event export:  node scripts/export-events-to-recombee.js
 *   5. Switch RECOMMENDATION_PROVIDER=recombee in .env
 *
 * All our event names and field names already match Recombee's API exactly:
 *   event_type: 'detail_view'   → AddDetailView
 *   event_type: 'cart_addition' → AddCartAddition
 *   event_type: 'purchase'      → AddPurchase
 *   event_type: 'rating'        → AddRating
 *   product_id                  → itemId
 *   customer_id / session_id    → userId
 *   recomm_id                   → recomm_id (recommendation click tracking)
 */

const ENABLED = process.env.ENABLE_RECOMBEE === "true"
const DB_ID   = process.env.RECOMBEE_DB_ID ?? ""
const TOKEN   = process.env.RECOMBEE_PRIVATE_TOKEN ?? ""

// ─── Types matching Recombee API ──────────────────────────────────────────────

export type RecombeeEventType =
    | "detail_view"
    | "cart_addition"
    | "purchase"
    | "rating"

export type RecombeeEvent = {
    event_type:   RecombeeEventType
    user_id:      string            // customer_id ?? session_id
    item_id:      string            // product_id
    timestamp?:   string            // ISO 8601
    amount?:      number
    price?:       number
    rating?:      number
    recomm_id?:   string
}

export type RecombeeProductProperties = {
    title:        string
    description?: string
    category?:    string
    collection?:  string
    price?:       number
    thumbnail?:   string
    handle?:      string
    tags?:        string[]
    published?:   boolean
}

// ─── Recombee API base URL ────────────────────────────────────────────────────
const BASE_URL = `https://rapi.recombee.com/${DB_ID}`

async function recombeeRequest(
    path: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    body?: object
): Promise<any> {
    if (!ENABLED || !DB_ID || !TOKEN) {
        throw new Error("[RecombeeAdapter] Not configured. Set ENABLE_RECOMBEE=true and credentials in .env")
    }

    const url = `${BASE_URL}${path}?hmac_timestamp=${Math.floor(Date.now() / 1000)}&hmac_sign=${TOKEN}`

    const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`[RecombeeAdapter] API error ${response.status}: ${text}`)
    }

    return response.json()
}

// ─── Send a single event to Recombee ─────────────────────────────────────────

/**
 * Mirrors our internal trackEvent() but sends to Recombee's API.
 * Call this alongside (or instead of) the local DB save when ENABLED.
 */
export async function sendEventToRecombee(event: RecombeeEvent): Promise<void> {
    if (!ENABLED) return

    const endpointMap: Record<RecombeeEventType, string> = {
        detail_view:   "detail-views",
        cart_addition: "cart-additions",
        purchase:      "purchases",
        rating:        "ratings",
    }

    const endpoint = endpointMap[event.event_type]

    const body: Record<string, any> = {
        userId:    event.user_id,
        itemId:    event.item_id,
        timestamp: event.timestamp ?? new Date().toISOString(),
        cascadeCreate: true,
    }

    if (event.amount   !== undefined) body.amount   = event.amount
    if (event.price    !== undefined) body.price    = event.price
    if (event.rating   !== undefined) body.rating   = event.rating
    if (event.recomm_id !== undefined) body.recommId = event.recomm_id

    await recombeeRequest(`/${endpoint}/`, "POST", body)
}

// ─── Sync a product to Recombee's item catalog ────────────────────────────────

/**
 * Call this when a product is created or updated.
 * Uses Recombee's SetItemValues which creates or updates the item.
 */
export async function syncProductToRecombee(
    productId: string,
    props: RecombeeProductProperties
): Promise<void> {
    if (!ENABLED) return

    await recombeeRequest(`/items/${productId}/`, "POST", {
        ...props,
        // Recombee needs boolean fields explicitly
        published: props.published ?? true,
    })
}

// ─── Fetch recommendations from Recombee ─────────────────────────────────────

/**
 * Get personalised recommendations for a user.
 * Returns an array of product IDs in recommended order.
 */
export async function getRecommendationsFromRecombee(opts: {
    user_id:  string
    limit?:   number
    scenario?: string
}): Promise<string[]> {
    if (!ENABLED) return []

    const { user_id, limit = 10, scenario = "homepage" } = opts

    const result = await recombeeRequest(
        `/users/${user_id}/recomms/`,
        "POST",
        {
            count:    limit,
            scenario,
            cascadeCreate: true,
            returnProperties: false,
        }
    )

    return (result?.recomms ?? []).map((r: any) => r.id as string)
}

export const recombeeAdapter = {
    isEnabled:        ENABLED,
    sendEvent:        sendEventToRecombee,
    syncProduct:      syncProductToRecombee,
    getRecommendations: getRecommendationsFromRecombee,
}

export default recombeeAdapter
