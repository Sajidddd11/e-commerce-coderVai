"use client"

import { useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { trackInitiateCheckout } from "@lib/util/facebook-pixel"

type InitiateCheckoutTrackerProps = {
  cart: HttpTypes.StoreCart
}

/**
 * Client component that tracks Facebook Pixel InitiateCheckout event
 * Fires once when checkout page loads
 */
export default function InitiateCheckoutTracker({ cart }: InitiateCheckoutTrackerProps) {
  const hasTracked = useRef(false)

  useEffect(() => {
    // Prevent duplicate tracking (React Strict Mode or re-renders)
    if (!cart || !cart.items || cart.items.length === 0 || hasTracked.current) return
    hasTracked.current = true

    const cartItems = cart.items.map((item) => ({
      id: item.product_id || item.variant_id || "",
      quantity: item.quantity || 1,
      price: item.unit_price || 0, // Price is already in correct currency units
    }))

    const totalValue = cart.total || 0 // Total is already in correct currency units
    const currency = cart.region?.currency_code?.toUpperCase() || "BDT"
    const numItems = cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0)

    trackInitiateCheckout({
      cartItems,
      currency,
      totalValue,
      numItems,
    })
  }, [cart.id]) // Only track once per cart ID

  // This component doesn't render anything
  return null
}

