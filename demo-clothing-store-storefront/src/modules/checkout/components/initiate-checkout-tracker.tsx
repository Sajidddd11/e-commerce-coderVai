"use client"

import { useEffect } from "react"
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
  useEffect(() => {
    // Track InitiateCheckout event only once when component mounts
    if (!cart || !cart.items || cart.items.length === 0) return

    const cartItems = cart.items.map((item) => ({
      id: item.product_id || item.variant_id || "",
      quantity: item.quantity || 1,
      price: (item.unit_price || 0) / 100, // Convert from cents
    }))

    const totalValue = (cart.total || 0) / 100 // Convert from cents
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

