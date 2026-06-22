"use client"

/**
 * SuggestedForYou — Client component that fetches & renders personalised
 * product recommendations. Used on the home page.
 *
 * Strategy waterfall (decided by backend):
 *   personalised  → if user has 5+ events
 *   mixed         → if 1–4 events
 *   trending      → no history (new / anonymous user)
 *
 * The component also handles:
 *   • detail_view tracking on card click (recomm_id forwarded)
 *   • Skeleton loading state
 *   • Graceful empty / error states (hides itself)
 */

import { useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { useRecommendations } from "@hooks/use-recommendations"
import { useTrackBehaviour } from "@hooks/use-track-behaviour"
import ProductPreview from "@modules/products/components/product-preview"

const STRATEGY_LABELS: Record<string, string> = {
  personalised:    "Suggested For You",
  mixed:           "Suggested For You",
  trending:        "Trending Right Now",
  bought_together: "Frequently Bought Together",
}

type SuggestedForYouProps = {
  region:      HttpTypes.StoreRegion
  customerId?: string
  regionId?:   string
  limit?:      number
  /** Section title override */
  title?:      string
}

export default function SuggestedForYou({
  region,
  customerId,
  regionId,
  limit = 10,
  title,
}: SuggestedForYouProps) {
  const { products, strategy, recommId, loading } = useRecommendations({
    customerId,
    regionId,
    limit,
    type: "auto",
  })

  const { track } = useTrackBehaviour()
  const hasTracked = useRef(false)

  // Once we have products, track an implicit "impression"
  // (not a real event — just used for debugging in dev)
  useEffect(() => {
    if (!loading && products.length > 0 && !hasTracked.current) {
      hasTracked.current = true
    }
  }, [loading, products])

  const sectionTitle = title ?? STRATEGY_LABELS[strategy] ?? "Suggested For You"

  // Show skeleton while loading
  if (loading) {
    return (
      <section
        className="w-full py-12 bg-white border-t border-slate-100"
        data-testid="suggested-for-you-section"
      >
        <div className="content-container">
          <div className="mb-8">
            <div className="h-8 w-56 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="w-12 h-1 bg-slate-200 rounded-full" />
          </div>
          <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex flex-col gap-3">
                <div className="aspect-square bg-slate-100 rounded animate-pulse" />
                <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  }

  // Hide if nothing to show
  if (products.length === 0) return null

  const handleCardClick = (product: HttpTypes.StoreProduct) => {
    if (!product.id) return
    track({
      event_type:   "detail_view",
      product_id:   product.id,
      category_id:  product.categories?.[0]?.id,
      collection_id: product.collection?.id,
      recomm_id:    recommId ?? undefined,
    })
  }

  return (
    <section
      className="w-full py-12 bg-white border-t border-slate-100"
      data-testid="suggested-for-you-section"
    >
      <div className="content-container">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl small:text-3xl font-bold text-slate-900 mb-2">
              {sectionTitle}
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-transparent rounded-full" />
          </div>
          {strategy === "personalised" && (
            <span className="hidden small:flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Personalised for you
            </span>
          )}
        </div>

        {/* Product grid */}
        <ul
          className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-5 gap-3 small:gap-4"
          data-testid="suggested-products-grid"
        >
          {products.map((product) => (
            <li
              key={product.id}
              className="h-full w-full"
              onClick={() => handleCardClick(product)}
            >
              <ProductPreview product={product} region={region} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
