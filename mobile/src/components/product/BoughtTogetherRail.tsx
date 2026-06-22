/**
 * BoughtTogetherRail — "Frequently Bought Together" horizontal strip.
 * Used on the product detail screen below the product info.
 *
 * Only renders when there are co-occurrence results for the given product.
 * Tracks detail_view + recomm_id when a suggestion is tapped.
 */

import { useEffect, useRef, useState } from "react"
import { View } from "react-native"
import { HttpTypes } from "@medusajs/types"
import { SectionHeader } from "@components/home/SectionHeader"
import { ProductRail } from "@components/product/ProductRail"
import { getRecommendations, trackEvent } from "@api/recommendations"
import { useRegionStore } from "@stores/region-store"

type BoughtTogetherRailProps = {
  productId:   string
  customerId?: string
}

export function BoughtTogetherRail({
  productId,
  customerId,
}: BoughtTogetherRailProps) {
  const region  = useRegionStore((s) => s.region)
  const isReady = useRegionStore((s) => s.isReady)

  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [recommId, setRecommId] = useState<string | null>(null)
  const [loading,  setLoading]  = useState(true)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!isReady || !productId || hasFetched.current) return
    hasFetched.current = true

    getRecommendations({
      type:        "bought_together",
      product_id:  productId,
      customer_id: customerId,
      region_id:   region?.id,
      limit:       8,
    })
      .then((res) => {
        setProducts(res.products ?? [])
        setRecommId(res.recomm_id ?? null)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [isReady, productId, customerId, region?.id])

  if (!loading && products.length === 0) return null

  return (
    <View style={{ marginTop: 8 }}>
      <SectionHeader title="Frequently Bought Together" />
      <ProductRail
        products={products}
        loading={loading}
        onProductPress={(product) => {
          if (!product?.id) return
          trackEvent({
            event_type:  "detail_view",
            product_id:  product.id,
            category_id: product.categories?.[0]?.id,
            recomm_id:   recommId ?? undefined,
          })
        }}
      />
    </View>
  )
}
