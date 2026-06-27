import { sdk } from "./sdk"
import { getAuthHeaders } from "@utils/storage"

export interface LoyaltyAccount {
  id: string
  customer_id: string
  points: number
  created_at: string
  updated_at: string
}

export interface LoyaltyHistory {
  id: string
  customer_id: string
  points: number
  type: "earn" | "redeem" | "admin_adjustment" | "refund"
  description: string | null
  order_id: string | null
  created_at: string
}

export interface LoyaltySettings {
  points_per_bdt_earned: number
  points_per_bdt_discount: number
}

/**
 * Fetches the user's available Zahan Coins balance and transaction history logs
 */
export async function retrieveLoyaltyDetails(): Promise<{
  account: LoyaltyAccount | null
  history: LoyaltyHistory[]
  settings?: LoyaltySettings
}> {
  const headers = await getAuthHeaders()
  if (!headers.authorization) return { account: null, history: [] }

  return sdk.client
    .fetch<{ account: LoyaltyAccount; history: LoyaltyHistory[]; settings?: LoyaltySettings }>("/store/loyalty/me", {
      method: "GET",
      headers,
    })
    .then((res) => res)
    .catch(() => ({ account: null, history: [] }))
}

/**
 * Applies the specified Zahan Coins points balance to the active cart
 */
export async function applyLoyaltyPoints(cartId: string, points: number) {
  const headers = await getAuthHeaders()
  if (!headers.authorization) return null

  return sdk.client.fetch<{
    message: string
    appliedPoints: number
    discountAmount: number
  }>("/store/loyalty/apply", {
    method: "POST",
    headers,
    body: { cart_id: cartId, points },
  })
}

/**
 * Removes applied loyalty points discount from the active cart
 */
export async function removeLoyaltyPoints(cartId: string) {
  const headers = await getAuthHeaders()
  if (!headers.authorization) return null

  return sdk.client.fetch<{
    message: string
  }>("/store/loyalty/remove", {
    method: "POST",
    headers,
    body: { cart_id: cartId },
  })
}
