"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { revalidateTag } from "next/cache"
import { getAuthHeaders, getCacheTag } from "./cookies"

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

export async function retrieveLoyaltyDetails(): Promise<{ account: LoyaltyAccount | null; history: LoyaltyHistory[] }> {
    const authHeaders = await getAuthHeaders()
    if (!authHeaders) return { account: null, history: [] }

    const headers = {
        ...authHeaders,
    }

    return await sdk.client
        .fetch<{ account: LoyaltyAccount; history: LoyaltyHistory[] }>(`/store/loyalty/me`, {
            method: "GET",
            headers,
            next: {
                revalidate: 0, // Always load fresh balance
            },
        })
        .then(res => res)
        .catch(() => ({ account: null, history: [] }))
}

export async function applyLoyaltyPoints(cartId: string, points: number) {
    const headers = {
        ...(await getAuthHeaders()),
    }

    try {
        const res = await sdk.client.fetch<{
            message: string
            appliedPoints: number
            discountAmount: number
        }>(`/store/loyalty/apply`, {
            method: "POST",
            headers,
            body: { cart_id: cartId, points },
        })

        // Revalidate carts tags so the totals recalculate on checkout
        const cartCacheTag = await getCacheTag("carts")
        revalidateTag(cartCacheTag)

        return res
    } catch (error: any) {
        return medusaError(error)
    }
}

export async function removeLoyaltyPoints(cartId: string) {
    const headers = {
        ...(await getAuthHeaders()),
    }

    try {
        const res = await sdk.client.fetch<{
            message: string
        }>(`/store/loyalty/remove`, {
            method: "POST",
            headers,
            body: { cart_id: cartId },
        })

        // Revalidate carts tags so the totals recalculate on checkout
        const cartCacheTag = await getCacheTag("carts")
        revalidateTag(cartCacheTag)

        return res
    } catch (error: any) {
        return medusaError(error)
    }
}
