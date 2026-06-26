"use client"

/**
 * SuggestedForYou — Client component that fetches & renders personalised
 * product recommendations. Styled to match FeaturedProductsShowcase.
 *
 * Strategy waterfall (decided by backend):
 *   personalised  → if user has 5+ events
 *   mixed         → if 1–4 events
 *   trending      → no history (new / anonymous user)
 *
 * "See All" button expands the grid from the initial limit to the full
 * recommendation set (fetched at 40 items, shown incrementally).
 */

import { useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { useRecommendations } from "@hooks/use-recommendations"
import { useTrackBehaviour } from "@hooks/use-track-behaviour"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import dynamic from "next/dynamic"

// Only load the debugger bundle when debug mode is enabled — zero cost in prod
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

  // Fetch limit + 1 upfront to determine if there is more
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
  const hasMore       = products.length > limit
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
      <div className="w-full bg-white py-8 small:py-10 medium:py-12 pb-4 small:pb-6 medium:pb-8">
        <div className="content-container">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col small:flex-row small:items-center small:justify-between gap-3 small:gap-0">
              <div className="flex flex-col gap-1 small:gap-2">
                <div className="h-8 w-56 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-2 xsmall:grid-cols-2 small:grid-cols-3 medium:grid-cols-4 large:grid-cols-5 gap-3 xsmall:gap-4 small:gap-4 medium:gap-5 large:gap-6">
              {Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="aspect-square bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Hide if nothing to show
  if (products.length === 0) return null

  return (
    <>
    <div
      className="w-full bg-white py-8 small:py-10 medium:py-12 pb-4 small:pb-6 medium:pb-8"
      data-testid="suggested-for-you-section"
    >
      <div className="content-container">
        <div className="flex flex-col gap-8">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="flex flex-col small:flex-row small:items-center small:justify-between gap-3 small:gap-0">
            <div className="flex flex-col gap-1 small:gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-lg xsmall:text-2xl small:text-3xl font-bold text-slate-900">
                  {sectionTitle}
                </h3>
                {strategy === "personalised" && (
                  <span className="hidden small:flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Personalised
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-xs xsmall:text-sm">
                {sectionSub}
              </p>
            </div>

            {/* "See All" link — redirects to suggested page */}
            {hasMore && (
              <LocalizedClientLink
                href="/suggested"
                className="inline-flex items-center gap-2 text-slate-900 hover:text-slate-600 font-semibold text-xs xsmall:text-sm group transition-colors w-fit"
              >
                See All
                <span className="transition-transform inline-block group-hover:translate-x-1">→</span>
              </LocalizedClientLink>
            )}
          </div>

          {/* ── Products Grid ───────────────────────────────────────────────── */}
          <div
            className="grid grid-cols-2 xsmall:grid-cols-2 small:grid-cols-3 medium:grid-cols-4 large:grid-cols-5 gap-3 xsmall:gap-4 small:gap-4 medium:gap-5 large:gap-6"
            data-testid="suggested-products-grid"
          >
            {visibleItems.map((product) => (
              <div
                key={product.id}
                className="group h-full rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg border border-grey-20 shadow-sm"
                onClick={() => handleCardClick(product)}
              >
                <ProductPreview product={product} region={region} isFeatured />
              </div>
            ))}
          </div>

          {/* ── Bottom "See All" for mobile (below the grid) ──────────────── */}
          {hasMore && (
            <div className="flex justify-center small:hidden">
              <LocalizedClientLink
                href="/suggested"
                className="px-6 py-2.5 text-sm font-semibold text-slate-900 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors inline-block text-center"
              >
                See All Products →
              </LocalizedClientLink>
            </div>
          )}

        </div>
      </div>
    </div>

    {/* ── Debug panel (floating, only when NEXT_PUBLIC_REC_DEBUG=true) ── */}
    {RecommendationDebugger && (
      <RecommendationDebugger debug={debug} loading={loading} error={error} />
    )}
  </>
  )
}
