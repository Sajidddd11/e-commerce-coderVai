"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { completeOrderAfterSSLCommerz, getCartIdFromSession } from "@lib/data/sslcommerz"
import { retrieveCart } from "@lib/data/cart"

// Helper to get cookie value in client component
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null
  return null
}

export default function SSLCommerzCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = searchParams.get("ssl_status")
  const tranId = searchParams.get("ssl_tran_id")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      if (status === "success") {
        try {
          // Get cart ID from multiple sources (in order of preference)
          let cartId = searchParams.get("cart_id")

          if (!cartId && typeof window !== "undefined") {
            cartId = localStorage.getItem("_medusa_cart_id_ssl")
            if (cartId) {
              localStorage.removeItem("_medusa_cart_id_ssl")
            }
          }

          if (!cartId) {
            cartId = getCookie("_medusa_cart_id")
          }

          // If not found, try to get from session_id via server action
          if (!cartId && tranId) {
            cartId = await getCartIdFromSession(tranId)
          }

          if (!cartId) {
            throw new Error("Cart not found. Please try again or contact support.")
          }

          // Check if cart is already completed
          const cart = await retrieveCart(cartId)

          if (!cart) {
            throw new Error("Cart not found")
          }

          if ((cart as any).completed_at) {
            console.log("[SSLCommerz] Cart already completed")
            router.push(`/account/orders`)
            return
          }

          // Complete the order using server action
          const result = await completeOrderAfterSSLCommerz(cartId)

          if (result.success && result.order) {
            // Clear cart cookie using server action (httpOnly cookies require server-side deletion)
            await fetch('/api/clear-cart', { method: 'POST' }).catch(() => { })
            // Got order details - redirect to confirmation page
            router.push(`/${result.countryCode}/order/${result.order.id}/confirmed`)
          } else if (result.success && result.guestCheckout) {
            // Clear cart cookie - order created successfully
            await fetch('/api/clear-cart', { method: 'POST' }).catch(() => { })
            // Guest checkout - order created but can't retrieve details
            // Redirect to homepage with success message
            router.push(`/?payment=success`)
          } else if (result.success && result.alreadyCompleted) {
            // Clear cart cookie
            await fetch('/api/clear-cart', { method: 'POST' }).catch(() => { })
            // Order completed, redirect to orders page
            router.push(`/account/orders`)
          } else {
            throw new Error(result.error || "Failed to complete order")
          }
        } catch (error: any) {
          console.error("Failed to complete order:", error)
          setError(error.message || "Failed to complete order")
          // Redirect to checkout with error after showing message
          setTimeout(() => {
            router.push(`/checkout?error=${encodeURIComponent(error.message || "Failed to complete order")}`)
          }, 3000)
        }
      } else if (status === "failed") {
        router.push(`/checkout?error=${encodeURIComponent("Payment failed. Please try again.")}`)
      } else if (status === "cancelled") {
        router.push(`/checkout?error=${encodeURIComponent("Payment was cancelled.")}`)
      } else {
        router.push(`/checkout`)
      }
    }

    handleCallback()
  }, [status, tranId, router, searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">✕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">
          {status === "success" ? "Completing your order..." : "Processing..."}
        </p>
      </div>
    </div>
  )
}

