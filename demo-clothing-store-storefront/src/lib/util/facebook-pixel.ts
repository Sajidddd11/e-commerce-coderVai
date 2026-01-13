/**
 * Facebook Pixel tracking utility
 * Provides type-safe methods to track e-commerce events
 */

// Extend the Window interface to include fbq
declare global {
  interface Window {
    fbq?: (
      action: string,
      eventName: string,
      data?: Record<string, any>
    ) => void
  }
}

export type PixelEventData = {
  content_ids?: string[]
  content_name?: string
  content_type?: string
  contents?: Array<{
    id: string
    quantity: number
    item_price?: number
  }>
  currency?: string
  value?: number
  num_items?: number
}

/**
 * Track Facebook Pixel event
 * Safe to call on both client and server (will only execute on client)
 */
const trackPixelEvent = (eventName: string, data?: PixelEventData) => {
  if (typeof window === "undefined" || !window.fbq) {
    return
  }

  try {
    window.fbq("track", eventName, data)
    console.log(`[FB Pixel] Tracked: ${eventName}`, data)
  } catch (error) {
    console.error(`[FB Pixel] Error tracking ${eventName}:`, error)
  }
}

/**
 * Track AddToCart event
 */
export const trackAddToCart = (params: {
  productId: string
  productName: string
  quantity: number
  price: number
  currency: string
}) => {
  trackPixelEvent("AddToCart", {
    content_ids: [params.productId],
    content_name: params.productName,
    content_type: "product",
    contents: [
      {
        id: params.productId,
        quantity: params.quantity,
        item_price: params.price,
      },
    ],
    currency: params.currency,
    value: params.price * params.quantity,
  })
}

/**
 * Track ViewContent event (product detail page)
 */
export const trackViewContent = (params: {
  productId: string
  productName: string
  price: number
  currency: string
}) => {
  trackPixelEvent("ViewContent", {
    content_ids: [params.productId],
    content_name: params.productName,
    content_type: "product",
    currency: params.currency,
    value: params.price,
  })
}

/**
 * Track InitiateCheckout event
 */
export const trackInitiateCheckout = (params: {
  cartItems: Array<{
    id: string
    quantity: number
    price: number
  }>
  currency: string
  totalValue: number
  numItems: number
}) => {
  trackPixelEvent("InitiateCheckout", {
    content_ids: params.cartItems.map((item) => item.id),
    contents: params.cartItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      item_price: item.price,
    })),
    currency: params.currency,
    value: params.totalValue,
    num_items: params.numItems,
  })
}

/**
 * Track Purchase event (order confirmation)
 */
export const trackPurchase = (params: {
  orderId: string
  orderItems: Array<{
    id: string
    quantity: number
    price: number
  }>
  currency: string
  totalValue: number
  numItems: number
}) => {
  trackPixelEvent("Purchase", {
    content_ids: params.orderItems.map((item) => item.id),
    contents: params.orderItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      item_price: item.price,
    })),
    content_type: "product",
    currency: params.currency,
    value: params.totalValue,
    num_items: params.numItems,
  })
}

