"use client"

/**
 * FrequentlyBoughtTogether — shows products co-purchased with the current product.
 * Placed on the product detail page below the product info.
 *
 * Tracks detail_view + recomm_id when a suggested card is clicked.
 */

import { HttpTypes } from "@medusajs/types"
import { useRecommendations } from "@hooks/use-recommendations"
import { useTrackBehaviour } from "@hooks/use-track-behaviour"
import ProductPreview from "@modules/products/components/product-preview"

type FrequentlyBoughtTogetherProps = {
  product:  HttpTypes.StoreProduct
  region:   HttpTypes.StoreRegion
  regionId?: string
}

export default function FrequentlyBoughtTogether({
  product,
  region,
  regionId,
}: FrequentlyBoughtTogetherProps) {
  const { products, recommId, loading } = useRecommendations({
    type:      "bought_together",
    productId: product.id,
    regionId,
    limit:     6,
  })

  const { track } = useTrackBehaviour()

  if (loading) {
    return (
      <div className="w-full py-8 border-t border-slate-100">
        <div className="h-6 w-52 bg-slate-200 rounded animate-pulse mb-6" />
        <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-6 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i}>
              <div className="aspect-square bg-slate-100 rounded animate-pulse mb-2" />
              <div className="h-3 bg-slate-100 rounded w-3/4 animate-pulse" />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (products.length === 0) return null

  const handleClick = (p: HttpTypes.StoreProduct) => {
    if (!p.id) return
    track({
      event_type:   "detail_view",
      product_id:   p.id,
      category_id:  p.categories?.[0]?.id,
      recomm_id:    recommId ?? undefined,
    })
  }

  return (
    <div
      className="w-full py-8 border-t border-slate-100"
      data-testid="frequently-bought-together"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 mb-1.5">
          Frequently Bought Together
        </h3>
        <div className="w-10 h-0.5 bg-gradient-to-r from-slate-400 to-transparent rounded-full" />
      </div>

      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-6 gap-3">
        {products.map((p) => (
          <li key={p.id} onClick={() => handleClick(p)}>
            <ProductPreview product={p} region={region} />
          </li>
        ))}
      </ul>
    </div>
  )
}
