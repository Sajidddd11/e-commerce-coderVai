import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { LOYALTY_MODULE } from "../modules/loyalty"
import type LoyaltyModuleService from "../modules/loyalty/service"

export default async function loyaltyOrderPlacedSubscriber({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    const orderId = data.id

    try {
        const query = container.resolve(ContainerRegistrationKeys.QUERY)
        const loyaltyService: LoyaltyModuleService = container.resolve(LOYALTY_MODULE)
        const promotionModuleService = container.resolve(Modules.PROMOTION)

        // 1. Fetch order details (including cart_id to find the loyalty promo code)
        const { data: orders } = await query.graph({
            entity: "order",
            fields: ["id", "display_id", "customer_id", "subtotal", "metadata", "cart_id"],
            filters: { id: orderId },
        })

        const order = orders?.[0] as any
        if (!order || !order.customer_id) {
            return
        }

        const customerId = order.customer_id
        const metadata = (order.metadata || {}) as Record<string, any>
        const pointsToRedeem = Number(metadata.loyalty_points_to_redeem) || 0

        // 2. Deduct redeemed points if any
        if (pointsToRedeem > 0) {
            console.log(`[Loyalty Subscriber] Deducting ${pointsToRedeem} points for customer ${customerId} (Order: ${orderId})`)
            await loyaltyService.adjustPoints(
                customerId,
                -pointsToRedeem,
                "redeem",
                `Redeemed points on order #${order.display_id || orderId}`,
                orderId
            )
        }

        // 3. Calculate and credit earned points
        const settings = await loyaltyService.getSettings()
        const orderSubtotalBDT = Number(order.subtotal || 0)
        const pointsEarned = Math.floor(orderSubtotalBDT * settings.points_per_bdt_earned)

        if (pointsEarned > 0) {
            console.log(`[Loyalty Subscriber] Crediting ${pointsEarned} points to customer ${customerId} (Order: ${orderId})`)
            await loyaltyService.adjustPoints(
                customerId,
                pointsEarned,
                "earn",
                `Earned points on order #${order.display_id || orderId}`,
                orderId
            )
        }

        // 4. Clean up the temporary LOYALTY promotion entity for this cart
        if (order.cart_id) {
            const promoCode = `LOYALTY-${order.cart_id}`
            const existingPromos = await promotionModuleService.listPromotions({ code: promoCode })
            if (existingPromos && existingPromos.length > 0) {
                await promotionModuleService.deletePromotions(existingPromos.map((p: any) => p.id))
                console.log(`[Loyalty Subscriber] Cleaned up promotion entity ${promoCode}`)
            }
        }
    } catch (error: any) {
        console.error(`[Loyalty Subscriber] Error processing order.placed: ${error.message}`)
    }
}

export const config: SubscriberConfig = {
    event: "order.placed",
}
