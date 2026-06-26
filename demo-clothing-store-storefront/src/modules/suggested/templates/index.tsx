"use client"

import { useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { useRecommendations } from "@hooks/use-recommendations"
import { useTrackBehaviour } from "@hooks/use-track-behaviour"
import ProductPreview from "@modules/products/components/product-preview"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import dynamic from "next/dynamic"

const RecommendationDebugger = process.env.NEXT_PUBLIC_REC_DEBUG === "true"
    ? dynamic(() => import("@modules/home/components/recommendation-debugger"), { ssr: false })
    : null

const STRATEGY_LABELS: Record<string, { title: string; subtitle: string }> = {
  personalised:    { title: "Suggested For You",   subtitle: "Handpicked based on your browsing history." },
  mixed:           { title: "Suggested For You",   subtitle: "Personalised picks just for you." },
  trending:        { title: "Trending Right Now",  subtitle: "Most loved products this week." },
  bought_together: { title: "Frequently Bought Together", subtitle: "Customers also love these." },
}

const FULL_LIMIT = 40

type SuggestedTemplateProps = {
  region:      HttpTypes.StoreRegion
  customerId?: string
}

export default function SuggestedTemplate({
  region,
  customerId,
}: SuggestedTemplateProps) {
  const { products, strategy, recommId, loading, error, debug } = useRecommendations({
    customerId,
    regionId: region.id,
    limit: FULL_LIMIT,
    type: "auto",
  })

  const { track } = useTrackBehaviour()
  const hasTracked = useRef(false)

  useEffect(() => {
    if (!loading && products.length > 0 && !hasTracked.current) {
      hasTracked.current = true
    }
  }, [loading, products])

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

  const labels       = STRATEGY_LABELS[strategy] ?? STRATEGY_LABELS.trending
  const pageTitle    = labels.title
  const pageSubtitle = labels.subtitle

  // Loading skeleton state
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-white to-slate-50">
        <div className="content-container py-8 small:py-12">
          <div className="flex flex-col gap-8 mb-12">
            <div className="flex flex-col gap-2">
              <div className="h-10 w-64 bg-slate-200 rounded animate-pulse" />
              <div className="h-5 w-80 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
          <SkeletonProductGrid numberOfProducts={10} />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="w-full min-h-screen bg-gradient-to-b from-white to-slate-50">
        <div className="content-container py-8 small:py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl small:text-4xl font-bold text-slate-900">
                {pageTitle}
              </h1>
              {strategy === "personalised" && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Personalised
                </span>
              )}
            </div>
            <p className="text-slate-600 text-base max-w-2xl">
              {pageSubtitle}
            </p>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <p className="text-slate-500 text-lg">
                No recommendations found yet. Keep browsing to see tailored recommendations!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xsmall:grid-cols-2 small:grid-cols-3 medium:grid-cols-4 large:grid-cols-5 gap-3 xsmall:gap-4 small:gap-4 medium:gap-5 large:gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group h-full rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg border border-slate-200 shadow-sm bg-white cursor-pointer"
                  onClick={() => handleCardClick(product)}
                >
                  <ProductPreview product={product} region={region} isFeatured />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {RecommendationDebugger && (
        <RecommendationDebugger debug={debug} loading={loading} error={error} />
      )}
    </>
  )
}
