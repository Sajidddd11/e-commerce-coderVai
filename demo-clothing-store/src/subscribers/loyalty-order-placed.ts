import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
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

        // 1. Fetch order details
        const { data: orders } = await query.graph({
            entity: "order",
            fields: ["id", "customer_id", "subtotal", "metadata"],
            filters: { id: orderId },
        })

        const order = orders?.[0]
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
                `Redeemed points on order #${orderId}`,
                orderId
            )
        }

        // 3. Calculate and credit earned points
        const settings = await loyaltyService.getSettings()
        const orderSubtotalBDT = (order.subtotal || 0) / 100
        const pointsEarned = Math.floor(orderSubtotalBDT * settings.points_per_bdt_earned)

        if (pointsEarned > 0) {
            console.log(`[Loyalty Subscriber] Crediting ${pointsEarned} points to customer ${customerId} (Order: ${orderId})`)
            await loyaltyService.adjustPoints(
                customerId,
                pointsEarned,
                "earn",
                `Earned points on order #${orderId}`,
                orderId
            )
        }
    } catch (error: any) {
        console.error(`[Loyalty Subscriber] Error processing order.placed: ${error.message}`)
    }
}

export const config: SubscriberConfig = {
    event: "order.placed",
}
