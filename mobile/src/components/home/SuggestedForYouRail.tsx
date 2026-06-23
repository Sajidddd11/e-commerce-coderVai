/**
 * SuggestedForYouRail — Mobile "Suggested For You" horizontal product strip.
 *
 * Fetches recommendations from the backend and renders them in a
 * scrollable ProductRail with a SectionHeader that includes a "See All" button.
 * Tapping "See All" navigates to a dedicated full-screen grid of all recommendations.
 *
 * Strategy labels:
 *   personalised  → "Suggested For You"
 *   mixed         → "Suggested For You"
 *   trending      → "Trending Right Now"
 */

import { useEffect, useRef, useState } from "react"
import { View } from "react-native"
import { useRouter } from "expo-router"
import { HttpTypes } from "@medusajs/types"
import { SectionHeader } from "@components/home/SectionHeader"
import { ProductRail } from "@components/product/ProductRail"
import { getRecommendations, trackEvent } from "@api/recommendations"
import { useRegionStore } from "@stores/region-store"

const STRATEGY_LABELS: Record<string, string> = {
  personalised:    "Suggested For You",
  mixed:           "Suggested For You",
  trending:        "Trending Right Now",
  bought_together: "Frequently Bought Together",
}

type SuggestedForYouRailProps = {
  customerId?: string
  limit?:      number
}

export function SuggestedForYouRail({
  customerId,
  limit = 10,
}: SuggestedForYouRailProps) {
  const region   = useRegionStore((s) => s.region)
  const isReady  = useRegionStore((s) => s.isReady)
  const router   = useRouter()

  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [strategy, setStrategy] = useState("trending")
  const [recommId, setRecommId] = useState<string | null>(null)
  const [loading,  setLoading]  = useState(true)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!isReady || hasFetched.current) return
    hasFetched.current = true

    getRecommendations({
      type:        "auto",
      customer_id: customerId,
      region_id:   region?.id,
      limit:       40, // fetch full list; rail shows first `limit` scrollably
    })
      .then((res) => {
        setProducts(res.products ?? [])
        setStrategy(res.strategy ?? "trending")
        setRecommId(res.recomm_id ?? null)
      })
      .catch(() => {
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [isReady, customerId, region?.id, limit])

  const label    = STRATEGY_LABELS[strategy] ?? "Suggested For You"
  const hasMore  = products.length > limit
  const visible  = products.slice(0, limit)

  if (!loading && products.length === 0) return null

  const handleSeeAll = () => {
    // Navigate to the dedicated recommendations screen
    router.push({
      pathname: "/recommendations",
      params: {
        strategy,
        title:      label,
        customer_id: customerId ?? "",
        region_id:   region?.id ?? "",
      },
    } as any)
  }

  return (
    <View>
      <SectionHeader
        title={label}
        onSeeAll={hasMore || products.length >= limit ? handleSeeAll : undefined}
      />
      <ProductRail
        products={visible}
        loading={loading}
        onProductPress={(product) => {
          // Track click with recomm_id so backend knows this view came from a recommendation
          if (!product?.id) return
          trackEvent({
            event_type:   "detail_view",
            product_id:   product.id,
            category_id:  product.categories?.[0]?.id,
            recomm_id:    recommId ?? undefined,
          })
        }}
      />
    </View>
  )
}
