import { model } from "@medusajs/framework/utils"

/**
 * BehaviourEvent — tracks all user interactions for the recommendation engine.
 *
 * Field names are intentionally aligned with Recombee's API so the data can be
 * forwarded to Recombee at any time without a schema change:
 *   event_type  → Recombee interaction type (detail_view, cart_addition, purchase, rating)
 *   session_id  → Recombee userId for anonymous/guest users
 *   product_id  → Recombee itemId
 *   recomm_id   → Recombee recomm_id (tracks clicks on recommended items)
 */
const BehaviourEvent = model.define("behaviour_event", {
    id: model.id().primaryKey(),

    // ─── User identity ───────────────────────────────────────────────────────
    /** Medusa customer ID — null for guests */
    customer_id: model.text().nullable(),
    /**
     * Persistent anonymous session identifier.
     * Web: stored in localStorage.
     * Mobile: stored in AsyncStorage.
     * Used as Recombee userId for guests.
     */
    session_id: model.text(),
    /**
     * Browser canvas/WebGL fingerprint (web) or device unique ID (mobile).
     * Allows cross-profile identity merging for the same physical device.
     */
    fingerprint_id: model.text().nullable(),

    // ─── Item identity ───────────────────────────────────────────────────────
    /** Medusa product ID — maps to Recombee itemId */
    product_id: model.text(),

    // ─── Event type ──────────────────────────────────────────────────────────
    /**
     * One of: 'detail_view' | 'cart_addition' | 'purchase' | 'rating'
     * Matches Recombee interaction type names exactly.
     */
    event_type: model.text(),

    // ─── Denormalized fields for fast SQL grouping ────────────────────────────
    /** Denormalized from product.categories — avoids a JOIN on every query */
    category_id: model.text().nullable(),
    /** Denormalized from product.collection — avoids a JOIN on every query */
    collection_id: model.text().nullable(),

    // ─── Recombee extra fields ───────────────────────────────────────────────
    /** Quantity (used for cart_addition and purchase events) */
    amount: model.number().nullable(),
    /** Unit price at time of event (used for cart_addition and purchase) */
    price: model.number().nullable(),
    /** Star rating 1–5 (used for rating events) */
    rating: model.number().nullable(),
    /**
     * Recommendation session ID returned by /store/recommendations.
     * When a user clicks a recommended product, include this value to
     * measure recommendation click-through and improve future results.
     * Also maps directly to Recombee's recomm_id field.
     */
    recomm_id: model.text().nullable(),
})

export default BehaviourEvent
