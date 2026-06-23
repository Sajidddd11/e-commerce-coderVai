import { MedusaService } from "@medusajs/framework/utils"
import BehaviourEvent from "./models/behaviour-event"
import ProductCooccurrence from "./models/product-cooccurrence"

// ─── Event type scoring weights (Recombee-compatible names) ──────────────────
const EVENT_SCORES: Record<string, number> = {
    detail_view:   1,
    cart_addition: 3,
    rating:        5,
    purchase:      10,
}

// ─── How many recent events to consider for personalisation ──────────────────
const PERSONALISATION_WINDOW = 60

export type TrackEventInput = {
    event_type:     "detail_view" | "cart_addition" | "purchase" | "rating"
    product_id:     string
    session_id:     string
    customer_id?:   string
    fingerprint_id?: string
    category_id?:   string
    collection_id?: string
    amount?:        number
    price?:         number
    rating?:        number
    recomm_id?:     string
}

class RecommendationModuleService extends MedusaService({
    BehaviourEvent,
    ProductCooccurrence,
}) {

    // ─────────────────────────────────────────────────────────────────────────
    // TRACK — record a user behaviour event
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Records a single user behaviour event.
     * Called from POST /store/track.
     * All field names are Recombee-compatible so data can be forwarded any time.
     */
    async trackEvent(input: TrackEventInput): Promise<void> {
        await this.createBehaviourEvents({
            customer_id:    input.customer_id   ?? null,
            session_id:     input.session_id,
            fingerprint_id: input.fingerprint_id ?? null,
            product_id:     input.product_id,
            event_type:     input.event_type,
            category_id:    input.category_id   ?? null,
            collection_id:  input.collection_id  ?? null,
            amount:         input.amount  ?? null,
            price:          input.price   ?? null,
            rating:         input.rating  ?? null,
            recomm_id:      input.recomm_id ?? null,
        })
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MERGE — attach all guest sessions to a customer on login
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Called when a guest logs in.
     * Links all behaviour recorded under session_id and/or fingerprint_id
     * to the now-known customer_id — so past browsing history is preserved.
     */
    async mergeGuestToCustomer(opts: {
        customer_id:     string
        session_id:      string
        fingerprint_id?: string
    }): Promise<void> {
        const { customer_id, session_id, fingerprint_id } = opts

        // We use standard list and update methods because Medusa v2 MedusaService 
        // doesn't expose the underlying MikroORM em.nativeUpdate directly.
        
        // Merge by session_id
        const sessionEvents = await this.listBehaviourEvents({
            session_id,
            customer_id: null
        }, { take: 5000 })
        
        if (sessionEvents.length > 0) {
            await this.updateBehaviourEvents(
                sessionEvents.map(e => ({ id: e.id, customer_id }))
            )
        }

        // Merge by fingerprint_id (covers other browser profiles on same device)
        if (fingerprint_id) {
            const fpEvents = await this.listBehaviourEvents({
                fingerprint_id,
                customer_id: null
            }, { take: 5000 })
            
            if (fpEvents.length > 0) {
                await this.updateBehaviourEvents(
                    fpEvents.map(e => ({ id: e.id, customer_id }))
                )
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STRATEGY 1 — Personalised (category affinity)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns product IDs personalised for a specific user.
     *
     * Algorithm:
     *   1. Fetch the user's last N behaviour events
     *   2. Compute weighted affinity score per category_id
     *   3. Find products in top-scoring categories
     *   4. Exclude products the user already purchased
     *   5. Return product IDs in affinity order
     *
     * Falls back gracefully when category_id is missing on events
     * (older events before the feature was added).
     */
    async getPersonalised(opts: {
        customer_id?:    string
        session_id?:     string
        fingerprint_id?: string
        limit?:          number
        excludeIds?:     string[]
    }): Promise<string[]> {
        const { customer_id, session_id, fingerprint_id, limit = 10, excludeIds = [] } = opts

        if (!customer_id && !session_id && !fingerprint_id) return []

        // ── Step 1: Fetch recent events ──────────────────────────────────────
        // Priority: customer_id > fingerprint_id > session_id
        // After merge, all guest events carry customer_id, giving full history.
        const eventFilter: Record<string, any> = { deleted_at: null }
        if (customer_id) {
            eventFilter.customer_id = customer_id
        } else if (fingerprint_id) {
            eventFilter.fingerprint_id = fingerprint_id
        } else if (session_id) {
            eventFilter.session_id = session_id
        }

        const recentEvents = await this.listBehaviourEvents(
            eventFilter,
            {
                take:  PERSONALISATION_WINDOW,
                order: { created_at: "DESC" },
            }
        )

        if (recentEvents.length === 0) return []

        // ── Step 2: Score categories by weighted interaction ─────────────────
        const categoryScores = new Map<string, number>()
        const purchasedProductIds = new Set<string>()

        for (const ev of recentEvents) {
            const score = EVENT_SCORES[ev.event_type] ?? 1

            if (ev.category_id) {
                categoryScores.set(
                    ev.category_id,
                    (categoryScores.get(ev.category_id) ?? 0) + score
                )
            }

            if (ev.event_type === "purchase") {
                purchasedProductIds.add(ev.product_id)
            }
        }

        if (categoryScores.size === 0) return []

        // ── Step 3: Get top categories sorted by score ───────────────────────
        const topCategoryIds = Array.from(categoryScores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id]) => id)

        // ── Step 4: Fetch products in those categories ───────────────────────
        // We fetch from behaviour_event itself (products the store has)
        // The route handler will then look up full product objects from Medusa
        const categoryEvents = await this.listBehaviourEvents(
            {
                category_id: topCategoryIds,
                deleted_at:  null,
            },
            {
                take:  limit * 5, // over-fetch to allow deduplication
                order: { created_at: "DESC" },
            }
        )

        // ── Step 5: Deduplicate + exclude purchased + limit ──────────────────
        const excluded = new Set([...purchasedProductIds, ...excludeIds])
        const seen = new Set<string>()
        const result: string[] = []

        for (const ev of categoryEvents) {
            if (!excluded.has(ev.product_id) && !seen.has(ev.product_id)) {
                seen.add(ev.product_id)
                result.push(ev.product_id)
                if (result.length >= limit) break
            }
        }

        return result
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STRATEGY 2 — Bought Together (co-occurrence)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns product IDs frequently bought together with a given product.
     * Powered by the nightly-rebuilt product_cooccurrence table.
     */
    async getBoughtTogether(opts: {
        product_id:  string
        limit?:      number
        excludeIds?: string[]
    }): Promise<string[]> {
        const { product_id, limit = 8, excludeIds = [] } = opts

        const pairs = await this.listProductCooccurrences(
            {
                product_a_id: product_id,
                deleted_at:   null,
            },
            {
                take:  limit + excludeIds.length,
                order: { count: "DESC" },
            }
        )

        const excluded = new Set(excludeIds)
        return pairs
            .map(p => p.product_b_id)
            .filter(id => !excluded.has(id))
            .slice(0, limit)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STRATEGY 3 — Trending (7-day aggregate)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns the most interacted-with product IDs in the last 7 days.
     * Used as fallback for new/anonymous users with no history.
     *
     * Weighted by event_type score so purchases count more than views.
     * The full aggregation is done in memory (the result set is small).
     */
    async getTrending(opts: {
        limit?:      number
        excludeIds?: string[]
    } = {}): Promise<string[]> {
        const { limit = 10, excludeIds = [] } = opts

        const since = new Date()
        since.setDate(since.getDate() - 7)

        // Fetch all events in the last 7 days
        // Medusa's list supports $gte via raw filter — we filter in JS for safety
        const recentEvents = await this.listBehaviourEvents(
            { deleted_at: null },
            { take: 5000, order: { created_at: "DESC" } }
        )

        const windowEvents = recentEvents.filter(
            ev => new Date(ev.created_at) >= since
        )

        // Aggregate score per product
        const productScores = new Map<string, number>()
        for (const ev of windowEvents) {
            const score = EVENT_SCORES[ev.event_type] ?? 1
            productScores.set(ev.product_id, (productScores.get(ev.product_id) ?? 0) + score)
        }

        const excluded = new Set(excludeIds)
        return Array.from(productScores.entries())
            .filter(([id]) => !excluded.has(id))
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([id]) => id)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPER — count user events (used by route to decide strategy)
    // ─────────────────────────────────────────────────────────────────────────

    async countUserEvents(opts: {
        customer_id?:    string
        session_id?:     string
        fingerprint_id?: string
    }): Promise<number> {
        // Priority: customer_id > fingerprint_id > session_id
        // After a merge, all guest events are tagged with customer_id,
        // so querying by customer_id gives the full cross-device count.
        const filter: Record<string, any> = { deleted_at: null }

        if (opts.customer_id) {
            filter.customer_id = opts.customer_id
        } else if (opts.fingerprint_id) {
            filter.fingerprint_id = opts.fingerprint_id
        } else if (opts.session_id) {
            filter.session_id = opts.session_id
        } else {
            return 0
        }

        const events = await this.listBehaviourEvents(filter, { take: 100 })
        return events.length
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CLEANUP — delete old anonymous events (called by nightly job)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Soft-deletes anonymous (no customer_id) behaviour events older than N days.
     * Keeps storage bounded on the VPS. Logged-in customer events are kept forever.
     */
    async cleanupOldGuestEvents(olderThanDays = 90): Promise<number> {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - olderThanDays)

        const oldEvents = await this.listBehaviourEvents(
            { customer_id: null, deleted_at: null },
            { take: 10000 }
        )

        const toDelete = oldEvents
            .filter(ev => new Date(ev.created_at) < cutoff)
            .map(ev => ev.id)

        if (toDelete.length === 0) return 0

        await this.softDeleteBehaviourEvents(toDelete)
        return toDelete.length
    }
}

export default RecommendationModuleService
