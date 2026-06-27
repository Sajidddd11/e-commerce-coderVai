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

        // 1. Fetch order details including promotions relation
        const { data: orders } = await query.graph({
            entity: "order",
            fields: ["id", "display_id", "customer_id", "subtotal", "metadata", "promotions.id", "promotions.code"],
            filters: { id: orderId },
        })

        const order = orders?.[0] as any
        if (!order || !order.customer_id) return

        const customerId = order.customer_id
        const metadata = (order.metadata || {}) as Record<string, any>
        const pointsToRedeem = Number(metadata.loyalty_points_to_redeem) || 0

        // 2. Deduct redeemed points if any
        if (pointsToRedeem > 0) {
            console.log(`[Loyalty] Deducting ${pointsToRedeem} pts for ${customerId} (Order: ${orderId})`)
            await loyaltyService.adjustPoints(
                customerId,
                -pointsToRedeem,
                "redeem",
                `Redeemed points on order #${order.display_id || orderId}`,
                orderId
            )
        }

        // 3. Credit earned points
        const settings = await loyaltyService.getSettings()
        const orderSubtotalBDT = Number(order.subtotal || 0)
        const pointsEarned = Math.floor(orderSubtotalBDT * settings.points_per_bdt_earned)

        if (pointsEarned > 0) {
            console.log(`[Loyalty] Crediting ${pointsEarned} pts to ${customerId} (Order: ${orderId})`)
            await loyaltyService.adjustPoints(
                customerId,
                pointsEarned,
                "earn",
                `Earned points on order #${order.display_id || orderId}`,
                orderId
            )
        }

        // 4. Clean up the LOYALTY- promotion entity created for this cart
        const orderPromotions: Array<{ id?: string; code?: string }> = order.promotions || []
        const loyaltyPromos = orderPromotions.filter((p) => p.code?.startsWith("LOYALTY-"))

        if (loyaltyPromos.length > 0) {
            const ids = loyaltyPromos.map((p) => p.id).filter(Boolean) as string[]
            if (ids.length > 0) {
                await promotionModuleService.deletePromotions(ids)
                console.log(`[Loyalty] Cleaned up promotion(s): ${loyaltyPromos.map((p) => p.code).join(", ")}`)
            }
        }

    } catch (error: any) {
        console.error(`[Loyalty Subscriber] Error processing order.placed: ${error.message}`)
    }
}

export const config: SubscriberConfig = {
    event: "order.placed",
}
