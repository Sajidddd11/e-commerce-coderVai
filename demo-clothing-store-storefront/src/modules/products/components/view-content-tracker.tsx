"use client"

import { useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { trackViewContent } from "@lib/util/facebook-pixel"

type ViewContentTrackerProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}

/**
 * Client component that tracks Facebook Pixel ViewContent event
 * Fires when product detail page loads
 */
export default function ViewContentTracker({ product, region }: ViewContentTrackerProps) {
  useEffect(() => {
    // Track ViewContent event when component mounts
    if (!product) return

    // Get the cheapest variant price
    const firstVariant = product.variants?.[0]
    const price = firstVariant?.calculated_price?.calculated_amount || 0

    trackViewContent({
      productId: product.id || "",
      productName: product.title || "",
      price: price / 100, // Convert from cents
      currency: region?.currency_code?.toUpperCase() || "BDT",
    })
  }, [product.id]) // Track once per product

  // This component doesn't render anything
  return null
}

