"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

/**
 * Complete order after SSLCommerz payment success
 * Handles both scenarios:
 * 1. Cart already completed by backend → Retrieve order
 * 2. Cart not completed → Complete it now
 */
export async function completeOrderAfterSSLCommerz(cartId: string) {
    try {
        const headers = await getAuthHeaders()

        // Step 1: Check current cart status
        console.log("[SSLCommerz] Checking cart status:", cartId)
        const cart = await sdk.store.cart.retrieve(cartId, {}, headers).catch(() => null)

        if (!cart) {
            return {
                success: false,
                error: "Cart not found",
            }
        }

        // Step 2: If cart already completed, find the order
        if ((cart as any).completed_at) {
            console.log("[SSLCommerz] Cart already completed, finding order...")

            // Wait a moment for order to be fully created
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // For logged-in users, try to get their orders
            try {
                const orders = await sdk.store.order.list(
                    {
                        limit: 5,
                        order: "-created_at",
                        fields: "+email"
                    } as any,
                    headers
                )

                // Find order matching this cart's email and recent timestamp
                const cartEmail = (cart as any).email
                if (orders?.orders && cartEmail) {
                    const matchingOrder = orders.orders.find((order: any) => {
                        const emailMatches = order.email === cartEmail
                        const isRecent = (Date.now() - new Date(order.created_at).getTime()) < 120000 // 2 min
                        return emailMatches && isRecent
                    })

                    if (matchingOrder) {
                        console.log("[SSLCommerz] Found matching order:", matchingOrder.id)
                        return {
                            success: true,
                            order: matchingOrder,
                            countryCode: matchingOrder.shipping_address?.country_code?.toLowerCase() || "bd",
                        }
                    }
                }
            } catch (e: any) {
                console.log("[SSLCommerz] Could not retrieve orders (possibly guest):", e?.message)
            }

            // If we can't get the order (guest checkout), still return success
            console.log("[SSLCommerz] Order created but can't retrieve (guest checkout)")
            return {
                success: true,
                alreadyCompleted: true,
                guestCheckout: true,
            }
        }

        // Step 3: Cart not completed yet - complete it now
        console.log("[SSLCommerz] Completing cart...")

        // Wait a bit for payment authorization to propagate
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const result = await sdk.store.cart.complete(cartId, {}, headers)

        if (result?.type === "order") {
            console.log("[SSLCommerz] Order created:", result.order.id)
            return {
                success: true,
                order: result.order,
                countryCode: result.order.shipping_address?.country_code?.toLowerCase() || "bd",
            }
        }

        return {
            success: false,
            error: "Cart completion did not create an order",
        }

    } catch (error: any) {
        console.error("[SSLCommerz] Error:", error?.message)

        // Handle 409 Conflict - cart already being completed
        if (error?.message?.includes("409") ||
            error?.message?.includes("conflict") ||
            error?.message?.includes("already being completed")) {

            console.log("[SSLCommerz] 409 Conflict detected, waiting for completion...")

            // Wait for the other process to finish
            await new Promise((resolve) => setTimeout(resolve, 3000))

            // Try to retrieve orders
            try {
                const headers = await getAuthHeaders()
                const orders = await sdk.store.order.list(
                    { limit: 5, order: "-created_at", fields: "+email" } as any,
                    headers
                )

                if (orders?.orders && orders.orders.length > 0) {
                    const recentOrder = orders.orders[0]
                    const isRecent = (Date.now() - new Date(recentOrder.created_at).getTime()) < 180000 // 3 min

                    if (isRecent) {
                        console.log("[SSLCommerz] Found order after 409:", recentOrder.id)
                        return {
                            success: true,
                            order: recentOrder,
                            countryCode: recentOrder.shipping_address?.country_code?.toLowerCase() || "bd",
                        }
                    }
                }
            } catch (e) {
                console.log("[SSLCommerz] Could not retrieve order after 409")
            }

            // Payment succeeded but can't get order details
            return {
                success: true,
                alreadyCompleted: true,
                guestCheckout: true,
            }
        }

        // Other errors
        return {
            success: false,
            error: error?.message || "Failed to complete order",
        }
    }
}

/**
 * Get cart ID from payment session
 */
export async function getCartIdFromSession(sessionId: string) {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        }

        if (publishableKey) {
            headers["x-publishable-api-key"] = publishableKey
        }

        const response = await fetch(
            `${backendUrl}/store/sslcommerz/get-cart-from-session?session_id=${sessionId}`,
            {
                method: "GET",
                headers,
            }
        )

        if (response.ok) {
            const data = await response.json()
            return data.cart_id
        }

        return null
    } catch (error) {
        console.error("Failed to get cart from session:", error)
        return null
    }
}
