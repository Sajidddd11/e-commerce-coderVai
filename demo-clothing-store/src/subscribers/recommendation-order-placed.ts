/**
 * Order Placed Subscriber — tracks purchase events for the recommendation engine.
 *
 * When an order is placed, we send a 'purchase' event for each line item
 * to the recommendation engine. This is the server-side equivalent of calling
 * trackEvent() from the frontend — more reliable since it always fires,
 * even if the user closed the browser before the success page loaded.
 *
 * We read session_id and fingerprint_id from the order metadata (set by the
 * storefront when creating the cart). The storefront should call:
 *   PATCH /store/carts/:id  { metadata: { session_id, fingerprint_id } }
 * when the cart is first created.
 */

import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { RECOMMENDATION_MODULE } from "../modules/recommendation"
import type RecommendationModuleService from "../modules/recommendation/service"

export default async function orderPlacedSubscriber({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    const orderId = data.id

    try {
        const query = container.resolve(ContainerRegistrationKeys.QUERY)
        const recommendationService: RecommendationModuleService =
            container.resolve(RECOMMENDATION_MODULE)

        // ── Fetch the order with its line items ───────────────────────────────
        const { data: orders } = await query.graph({
            entity: "order",
            fields: [
                "id",
                "customer_id",
                "metadata",
                "items.id",
                "items.product_id",
                "items.quantity",
                "items.unit_price",
                "items.product.collection_id",
                "items.product.categories.id",
            ],
            filters: { id: orderId },
        })

        const order = orders?.[0]
        if (!order) return

        const session_id     = (order.metadata as any)?.session_id     ?? `order_${orderId}`
        const fingerprint_id = (order.metadata as any)?.fingerprint_id ?? undefined
        const customer_id    = order.customer_id ?? undefined

        if (!order.items || order.items.length === 0) return

        // ── Fetch products to get category and collection IDs ───────────────
        const productIds = order.items.map((i: any) => i.product_id).filter(Boolean)
        let productMap: Record<string, any> = {}
        
        if (productIds.length > 0) {
            const { data: products } = await query.graph({
                entity: "product",
                fields: [
                    "id",
                    "collection_id",
                    "categories.id"
                ],
                filters: { id: productIds }
            })
            productMap = products.reduce((acc: any, p: any) => {
                acc[p.id] = p
                return acc
            }, {})
        }

        // ── Send a purchase event for each line item ───────────────────────────
        // Fire all in parallel — if one fails, others still succeed
        await Promise.allSettled(
            (order.items as any[])
                .filter((item: any) => item.product_id)
                .map((item: any) => {
                    const product = productMap[item.product_id]
                    return recommendationService.trackEvent({
                        event_type:     "purchase",
                        product_id:     item.product_id,
                        session_id,
                        customer_id,
                        fingerprint_id,
                        amount:         item.quantity,
                        price:          item.unit_price,
                        category_id:    product?.categories?.[0]?.id,
                        collection_id:  product?.collection_id,
                    })
                })
        )

        // ── Merge guest session to customer if this is a first-time login ──────
        if (customer_id && session_id) {
            await recommendationService.mergeGuestToCustomer({
                customer_id,
                session_id,
                fingerprint_id,
            })
        }

        console.log(
            `[Recommendation Subscriber] ✅ Tracked ${order.items.length} purchase events for order ${orderId}`
        )
    } catch (error: any) {
        // Never crash the order flow over a recommendation tracking failure
        console.error("[Recommendation Subscriber] ⚠️ Failed to track purchase:", error?.message)
    }
}

export const config: SubscriberConfig = {
    event: "order.placed",
}
