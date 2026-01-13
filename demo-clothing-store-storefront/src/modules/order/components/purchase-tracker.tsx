"use client"

import { useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { trackPurchase } from "@lib/util/facebook-pixel"

type PurchaseTrackerProps = {
  order: HttpTypes.StoreOrder
}

/**
 * Client component that tracks Facebook Pixel Purchase event
 * Fires once when order confirmation page loads
 */
export default function PurchaseTracker({ order }: PurchaseTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    // Prevent duplicate tracking (React Strict Mode or re-renders)
    if (!order || hasTracked.current) return
    hasTracked.current = true

    const orderItems =
      order.items?.map((item) => ({
        id: item.product_id || item.variant_id || "",
        quantity: item.quantity || 1,
        price: (item.unit_price || 0) / 100, // Convert from cents
      })) || []

    const totalValue = (order.total || 0) / 100 // Convert from cents
    const currency = order.currency_code?.toUpperCase() || "BDT"
    const numItems = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0

    trackPurchase({
      orderId: order.id || "",
      orderItems,
      currency,
      totalValue,
      numItems,
    })
  }, [order.id]) // Only track once per order ID

  // This component doesn't render anything
  return null
}

