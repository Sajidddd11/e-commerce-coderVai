/**
 * useTrackBehaviour — React hook for tracking user behaviour events.
 *
 * Usage:
 *   const { track } = useTrackBehaviour()
 *
 *   // On product page mount:
 *   track({ event_type: 'detail_view', product_id: 'prod_xxx', category_id: cat.id })
 *
 *   // On add to cart:
 *   track({ event_type: 'cart_addition', product_id, amount: qty, price: unitPrice })
 *
 *   // On review submit:
 *   track({ event_type: 'rating', product_id, rating: stars })
 *
 * Purchase events are tracked server-side via the order subscriber,
 * so you do NOT need to call track() for purchases on the frontend.
 */

"use client"

import { useCallback, useRef } from "react"
import { getFingerprint, getSessionId } from "@lib/fingerprint"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export type TrackEventInput = {
    event_type:     "detail_view" | "cart_addition" | "rating"
    product_id:     string
    category_id?:   string
    collection_id?: string
    amount?:        number
    price?:         number
    rating?:        number
    recomm_id?:     string  // include if user clicked a recommendation
    customer_id?:   string
}

export function useTrackBehaviour() {
    // Track in-flight requests to avoid duplicate events
    const pendingRef = useRef<Set<string>>(new Set())

    const track = useCallback(async (input: TrackEventInput) => {
        const dedupeKey = `${input.event_type}:${input.product_id}`

        // Debounce: skip if same event is already in-flight
        if (pendingRef.current.has(dedupeKey)) return
        pendingRef.current.add(dedupeKey)

        try {
            const [fingerprint_id, session_id] = await Promise.all([
                getFingerprint(),
                Promise.resolve(getSessionId()),
            ])

            // Fire and forget — never await or block the UI
            fetch(`${BACKEND_URL}/store/track`, {
                method:  "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
                        ? { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY }
                        : {}
                    ),
                },
                body: JSON.stringify({
                    ...input,
                    session_id,
                    fingerprint_id,
                }),
            }).catch(() => {
                // Silently ignore — tracking should never affect UX
            })
        } catch {
            // Ignore all errors — tracking is non-critical
        } finally {
            // Remove from pending after a short delay (allows re-tracking after debounce window)
            setTimeout(() => pendingRef.current.delete(dedupeKey), 2000)
        }
    }, [])

    return { track }
}
