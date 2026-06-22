"use client"

/**
 * ProductViewTracker — invisible component that fires a detail_view event
 * when a product page is first rendered client-side.
 *
 * Place this inside the ProductTemplate, which is a Server Component —
 * we need "use client" here because it reads the fingerprint from localStorage.
 */

import { useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { useTrackBehaviour } from "@hooks/use-track-behaviour"

type ProductViewTrackerProps = {
  product: HttpTypes.StoreProduct
}

export default function ProductViewTracker({ product }: ProductViewTrackerProps) {
  const { track } = useTrackBehaviour()
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current || !product?.id) return
    tracked.current = true

    const price = product.variants?.[0]?.calculated_price?.calculated_amount

    track({
      event_type:    "detail_view",
      product_id:    product.id,
      category_id:   product.categories?.[0]?.id,
      collection_id: product.collection?.id ?? product.collection_id,
      price,
    })
  }, [product?.id])

  return null
}
