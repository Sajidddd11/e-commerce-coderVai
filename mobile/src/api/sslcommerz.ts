import { HttpTypes } from "@medusajs/types"
import { sdk } from "./sdk"
import { MEDUSA_BACKEND, PUBLISHABLE_KEY } from "./sdk"
import { getAuthHeaders } from "@utils/storage"
import { listOrders } from "./orders"

/**
 * Ported from web src/lib/data/sslcommerz.ts.
 * Completes an order after returning from the SSLCommerz in-app browser flow.
 */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export type CompleteSSLResult =
  | { success: true; order: HttpTypes.StoreOrder }
  | { success: true; alreadyCompleted: true; guestCheckout?: boolean }
  | { success: false; error: string }

async function findRecentOrderByEmail(
  email?: string | null
): Promise<HttpTypes.StoreOrder | null> {
  if (!email) return null
  const orders = await listOrders(10, 0)
  const threeMinAgo = Date.now() - 3 * 60 * 1000
  const match = orders.find(
    (o) =>
      o.email === email &&
      new Date(o.created_at as string).getTime() >= threeMinAgo
  )
  return match ?? null
}

export async function completeOrderAfterSSLCommerz(
  cartId: string
): Promise<CompleteSSLResult> {
  try {
    const headers = await getAuthHeaders()
    const { cart } = await sdk.store.cart.retrieve(cartId, {}, headers)

    // Cart already completed during the payment-success webhook
    if ((cart as any)?.completed_at) {
      await sleep(1500)
      const orderId =
        (cart as any).order_id || (cart as any).metadata?.order_id

      if (orderId) {
        const { order } = await sdk.store.order.retrieve(orderId, {}, headers)
        if (order) return { success: true, order }
      }

      const recent = await findRecentOrderByEmail(cart.email)
      if (recent) return { success: true, order: recent }

      return { success: true, alreadyCompleted: true, guestCheckout: true }
    }

    // Not yet completed — give the payment a moment to propagate, then complete.
    // Use native fetch with an explicit {} body: React Native sends a null byte
    // for bodyless POSTs with Content-Type: application/json, causing a 500.
    await sleep(1500)
    try {
      const rawRes = await fetch(`${MEDUSA_BACKEND}/store/carts/${cartId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(PUBLISHABLE_KEY ? { "x-publishable-api-key": PUBLISHABLE_KEY } : {}),
          ...headers,
        },
        body: JSON.stringify({}),
      })
      const res: {
        type: "order" | "cart"
        order: HttpTypes.StoreOrder
        cart: HttpTypes.StoreCart
      } = await rawRes.json()
      if (res?.type === "order") {
        return { success: true, order: res.order }
      }
      return { success: false, error: "Order could not be completed" }
    } catch (e: any) {
      // 409 — cart was completed concurrently by the webhook
      if (e?.status === 409 || /409|conflict/i.test(e?.message ?? "")) {
        await sleep(3000)
        const recent = await findRecentOrderByEmail(cart.email)
        if (recent) return { success: true, order: recent }
        return { success: true, alreadyCompleted: true }
      }
      return { success: false, error: e?.message ?? "Completion failed" }
    }
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Could not complete order" }
  }
}

/** Fallback resolution of the cart id from an SSLCommerz session/transaction id. */
export async function getCartIdFromSession(
  sessionId: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `${MEDUSA_BACKEND}/store/sslcommerz/get-cart-from-session?session_id=${sessionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(PUBLISHABLE_KEY ? { "x-publishable-api-key": PUBLISHABLE_KEY } : {}),
        },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.cart_id ?? null
  } catch {
    return null
  }
}
