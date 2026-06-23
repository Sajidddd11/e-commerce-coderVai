/**
 * useRecommendations — fetches "Suggested For You" product lists from the backend.
 *
 * Customer ID resolution (priority order):
 *   1. customerId prop (e.g. passed from server component after retrieveCustomer())
 *   2. Auto-fetched from /store/customers/me if logged in (JWT cookie present)
 *   3. Omitted (falls back to session_id / fingerprint_id only)
 *
 * Debug mode:
 *   Set NEXT_PUBLIC_REC_DEBUG=true in .env.local to enable the debug panel.
 *   The `debug` field in the return value is populated when debug mode is on.
 */

"use client"

import { useEffect, useState, useRef } from "react"
import { getFingerprint, getSessionId } from "@lib/fingerprint"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const DEBUG_MODE  = process.env.NEXT_PUBLIC_REC_DEBUG === "true"

type RecommendationType = "auto" | "personalised" | "trending" | "bought_together"

type UseRecommendationsOpts = {
    type?:       RecommendationType
    productId?:  string
    customerId?: string
    regionId?:   string
    limit?:      number
}

export type RecommendationDebugInfo = {
    // Identity
    session_id:       string
    fingerprint_id:   string
    customer_id_prop: string | null       // what was passed as a prop
    customer_id_auto: string | null       // what was auto-fetched from Medusa
    customer_id_used: string | null       // final value sent to backend

    // Request
    query_url:        string              // full URL sent to /store/recommendations
    requested_limit:  number
    requested_type:   string

    // Response
    strategy_returned: string
    products_count:    number
    recomm_id:         string | null
    raw_response:      any               // full JSON response

    // Timing
    fetch_ms:          number

    // Notes — human-readable explanation of what happened
    notes:             string[]
}

type RecommendationsResult = {
    products:  HttpTypes.StoreProduct[]
    strategy:  string
    recommId:  string | null
    loading:   boolean
    error:     string | null
    debug:     RecommendationDebugInfo | null
}

/**
 * Tries to get the current customer's ID from the Medusa JS SDK.
 * The SDK automatically sends the browser's auth token (JWT in localStorage/cookie).
 * Returns null silently if the user is not logged in.
 */
async function fetchCurrentCustomerId(): Promise<string | null> {
    try {
        const { customer } = await sdk.store.customer.retrieve({ fields: "id" })
        return customer?.id ?? null
    } catch {
        return null
    }
}

export function useRecommendations(opts: UseRecommendationsOpts = {}): RecommendationsResult {
    const { type = "auto", productId, customerId: customerIdProp, regionId, limit = 10 } = opts

    const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
    const [strategy, setStrategy] = useState("")
    const [recommId, setRecommId] = useState<string | null>(null)
    const [loading,  setLoading]  = useState(true)
    const [error,    setError]    = useState<string | null>(null)
    const [debug,    setDebug]    = useState<RecommendationDebugInfo | null>(null)

    // Cache auto-resolved customerId so we only hit /customers/me once
    const resolvedCustomerIdRef = useRef<string | null | undefined>(undefined)

    useEffect(() => {
        let cancelled = false

        const fetchRecommendations = async () => {
            setLoading(true)
            setError(null)

            const t0 = Date.now()
            const notes: string[] = []

            try {
                const [fingerprint_id, session_id] = await Promise.all([
                    getFingerprint(),
                    Promise.resolve(getSessionId()),
                ])

                // ── Resolve customer_id ──────────────────────────────────────
                let customerIdAuto: string | null = null
                let customerId = customerIdProp ?? null

                if (!customerId) {
                    notes.push("No customerId prop — attempting auto-fetch from /store/customers/me")
                    if (resolvedCustomerIdRef.current === undefined) {
                        customerIdAuto = await fetchCurrentCustomerId()
                        resolvedCustomerIdRef.current = customerIdAuto
                    } else {
                        customerIdAuto = resolvedCustomerIdRef.current
                    }
                    if (customerIdAuto) {
                        customerId = customerIdAuto
                        notes.push(`✅ Auto-fetched customer_id: ${customerIdAuto}`)
                    } else {
                        notes.push("⚠️ Not logged in (or SDK fetch failed) — will query by session_id/fingerprint_id only")
                    }
                } else {
                    notes.push(`✅ customer_id from prop: ${customerId}`)
                }

                // ── Build query params ───────────────────────────────────────
                const params = new URLSearchParams({
                    session_id,
                    fingerprint_id,
                    type,
                    limit: String(limit),
                })

                if (customerId)  params.set("customer_id",  customerId)
                if (productId)   params.set("product_id",   productId)
                if (regionId)    params.set("region_id",    regionId)

                const queryUrl = `${BACKEND_URL}/store/recommendations?${params.toString()}`

                if (!customerId) {
                    notes.push("⚠️ customer_id NOT sent — backend will use session_id/fingerprint_id to count events")
                    notes.push(`   → If event count < 5 → strategy will be 'trending' or 'mixed'`)
                }

                const headers: Record<string, string> = { "Content-Type": "application/json" }
                if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
                    headers["x-publishable-api-key"] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
                }

                const res = await fetch(queryUrl, { headers })
                const fetchMs = Date.now() - t0

                if (!res.ok) throw new Error(`HTTP ${res.status}`)

                const data = await res.json()

                notes.push(`✅ Backend returned strategy: "${data.strategy}" with ${data.products?.length ?? 0} products`)

                if (data.strategy === "trending") {
                    notes.push("⚠️ Got trending — this means event count < 5 for the resolved identity")
                    notes.push(`   Fix: Browse 5+ products while logged in, or ensure merge ran after login`)
                } else if (data.strategy === "mixed") {
                    notes.push("ℹ️ Got mixed — 1–4 events found. Browse more products to unlock personalised.")
                } else if (data.strategy === "personalised") {
                    notes.push("🎯 Personalised! User has 5+ events.")
                }

                if (!cancelled) {
                    setProducts(data.products ?? [])
                    setStrategy(data.strategy ?? "")
                    setRecommId(data.recomm_id ?? null)

                    if (DEBUG_MODE) {
                        setDebug({
                            session_id,
                            fingerprint_id,
                            customer_id_prop: customerIdProp ?? null,
                            customer_id_auto: customerIdAuto,
                            customer_id_used: customerId,
                            query_url:        queryUrl,
                            requested_limit:  limit,
                            requested_type:   type,
                            strategy_returned: data.strategy ?? "",
                            products_count:   data.products?.length ?? 0,
                            recomm_id:        data.recomm_id ?? null,
                            raw_response:     data,
                            fetch_ms:         fetchMs,
                            notes,
                        })
                    }
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message ?? "Failed to load recommendations")
                    if (DEBUG_MODE) {
                        setDebug({
                            session_id:        "error",
                            fingerprint_id:    "error",
                            customer_id_prop:  customerIdProp ?? null,
                            customer_id_auto:  null,
                            customer_id_used:  null,
                            query_url:         "",
                            requested_limit:   limit,
                            requested_type:    type,
                            strategy_returned: "error",
                            products_count:    0,
                            recomm_id:         null,
                            raw_response:      null,
                            fetch_ms:          Date.now() - t0,
                            notes:             [...notes, `❌ Error: ${err?.message}`],
                        })
                    }
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchRecommendations()
        return () => { cancelled = true }
    }, [type, productId, customerIdProp, regionId, limit])

    return { products, strategy, recommId, loading, error, debug: DEBUG_MODE ? debug : null }
}
