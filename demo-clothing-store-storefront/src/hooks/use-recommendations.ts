/**
 * useRecommendations — fetches "Suggested For You" product lists from the backend.
 *
 * Usage (Home page):
 *   const { products, strategy, loading } = useRecommendations({ limit: 10 })
 *
 * Usage (Product detail page — "You may also like"):
 *   const { products } = useRecommendations({ productId: 'prod_xxx', limit: 6 })
 *
 * Usage (Product detail page — "Bought together"):
 *   const { products } = useRecommendations({
 *     productId: 'prod_xxx',
 *     type: 'bought_together',
 *     limit: 4
 *   })
 */

"use client"

import { useEffect, useState } from "react"
import { getFingerprint, getSessionId } from "@lib/fingerprint"
import { HttpTypes } from "@medusajs/types"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

type RecommendationType = "auto" | "personalised" | "trending" | "bought_together"

type UseRecommendationsOpts = {
    type?:       RecommendationType
    productId?:  string
    customerId?: string
    regionId?:   string
    limit?:      number
}

type RecommendationsResult = {
    products:  HttpTypes.StoreProduct[]
    strategy:  string
    recommId:  string | null
    loading:   boolean
    error:     string | null
}

export function useRecommendations(opts: UseRecommendationsOpts = {}): RecommendationsResult {
    const { type = "auto", productId, customerId, regionId, limit = 10 } = opts

    const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
    const [strategy, setStrategy] = useState("")
    const [recommId, setRecommId] = useState<string | null>(null)
    const [loading,  setLoading]  = useState(true)
    const [error,    setError]    = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        const fetchRecommendations = async () => {
            setLoading(true)
            setError(null)

            try {
                const [fingerprint_id, session_id] = await Promise.all([
                    getFingerprint(),
                    Promise.resolve(getSessionId()),
                ])

                const params = new URLSearchParams({
                    session_id,
                    fingerprint_id,
                    type,
                    limit: String(limit),
                })

                if (customerId) params.set("customer_id",  customerId)
                if (productId)  params.set("product_id",   productId)
                if (regionId)   params.set("region_id",    regionId)

                const headers: Record<string, string> = {
                    "Content-Type": "application/json",
                }
                if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
                    headers["x-publishable-api-key"] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
                }

                const res = await fetch(
                    `${BACKEND_URL}/store/recommendations?${params.toString()}`,
                    { headers }
                )

                if (!res.ok) throw new Error(`HTTP ${res.status}`)

                const data = await res.json()

                if (!cancelled) {
                    setProducts(data.products ?? [])
                    setStrategy(data.strategy ?? "")
                    setRecommId(data.recomm_id ?? null)
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err?.message ?? "Failed to load recommendations")
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchRecommendations()
        return () => { cancelled = true }
    }, [type, productId, customerId, regionId, limit])

    return { products, strategy, recommId, loading, error }
}
