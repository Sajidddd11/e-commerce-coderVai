"use client"

import { useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { useRecommendations } from "@hooks/use-recommendations"
import { useTrackBehaviour } from "@hooks/use-track-behaviour"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductCardWithPrice from "../category-showcase/product-card"
import dynamic from "next/dynamic"

const RecommendationDebugger = process.env.NEXT_PUBLIC_REC_DEBUG === "true"
    ? dynamic(() => import("@modules/home/components/recommendation-debugger"), { ssr: false })
    : null

const STRATEGY_LABELS: Record<string, { title: string; subtitle: string }> = {
  personalised:    { title: "Suggested For You",   subtitle: "Handpicked based on your browsing" },
  mixed:           { title: "Suggested For You",   subtitle: "Personalised picks just for you" },
  trending:        { title: "Trending Right Now",  subtitle: "Most loved products this week" },
  bought_together: { title: "Frequently Bought Together", subtitle: "Customers also love these" },
}

const INITIAL_LIMIT = 5

type SuggestedForYouProps = {
  region:      HttpTypes.StoreRegion
  customerId?: string
  regionId?:   string
  title?:      string
  limit?:      number
}

export default function SuggestedForYou({
  region,
  customerId,
  regionId,
  title,
  limit = INITIAL_LIMIT,
}: SuggestedForYouProps) {

  const { products, strategy, recommId, loading, error, debug } = useRecommendations({
    customerId,
    regionId,
    limit: limit + 1,
    type: "auto",
  })

  const { track } = useTrackBehaviour()
  const hasTracked = useRef(false)

  useEffect(() => {
    if (!loading && products.length > 0 && !hasTracked.current) {
      hasTracked.current = true
    }
  }, [loading, products])

  const labels        = STRATEGY_LABELS[strategy] ?? STRATEGY_LABELS.trending
  const sectionTitle  = title ?? labels.title
  const sectionSub    = labels.subtitle
  const visibleItems  = products.slice(0, limit)

  const handleCardClick = (product: HttpTypes.StoreProduct) => {
    if (!product.id) return
    track({
      event_type:    "detail_view",
      product_id:    product.id,
      category_id:   product.categories?.[0]?.id,
      collection_id: product.collection?.id,
      recomm_id:     recommId ?? undefined,
    })
  }

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full flex flex-col gap-4 animate-pulse">
        {/* Title skeleton */}
        <div className="h-8 w-64 bg-slate-200 rounded-sm mb-4" />

        {/* Grid skeleton */}
        <div className="w-full grid grid-cols-2 xsmall:grid-cols-3 small:grid-cols-6 gap-4 small:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-square bg-slate-100 rounded-sm w-full" />
              <div className="h-4 bg-slate-100 rounded-sm w-3/4 mx-auto" />
              <div className="h-4 bg-slate-100 rounded-sm w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Hide if nothing to show
  if (products.length === 0) return null

  return (
    <div className="w-full flex flex-col" data-testid="suggested-for-you-section">
      {/* Title */}
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl xsmall:text-2xl small:text-3xl font-bold text-grey-90">
            {sectionTitle}
          </h3>
          {strategy === "personalised" && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Personalised
            </span>
          )}
        </div>
        <p className="text-slate-600 text-xs xsmall:text-sm">
          {sectionSub}
        </p>
      </div>

      {/* Main Grid Section */}
      <div className="w-full grid grid-cols-2 xsmall:grid-cols-3 small:grid-cols-6 gap-4 small:gap-6">
        {visibleItems.map((product) => (
          <ProductCardWithPrice 
            key={product.id} 
            product={product} 
            onClick={() => handleCardClick(product)}
          />
        ))}

        {/* See All Card */}
        <LocalizedClientLink
          href="/suggested"
          className="group rounded-sm relative overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center min-h-full"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:opacity-30 transition-opacity duration-300 text-center px-4">
            <h3 className="text-sm small:text-base font-bold text-gray-900 mb-1">
              See All
            </h3>
            <p className="text-xs text-gray-600">
              View Collection
            </p>
          </div>

          <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-center">
              <p className="text-white font-semibold text-sm small:text-base">
                See All Products
              </p>
              <p className="text-white/80 text-xs mt-1">
                →
              </p>
            </div>
          </div>
        </LocalizedClientLink>
      </div>

      {/* ── Debug panel (floating, only when NEXT_PUBLIC_REC_DEBUG=true) ── */}
      {RecommendationDebugger && (
        <RecommendationDebugger debug={debug} loading={loading} error={error} />
      )}
    </div>
  )
}
