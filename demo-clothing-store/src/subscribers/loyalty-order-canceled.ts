import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { LOYALTY_MODULE } from "../modules/loyalty"
import type LoyaltyModuleService from "../modules/loyalty/service"

export default async function loyaltyOrderCanceledSubscriber({
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

        // 2. Refund redeemed points
        if (pointsToRedeem > 0) {
            console.log(`[Loyalty Subscriber] Refunded ${pointsToRedeem} points to customer ${customerId} (Canceled Order: ${orderId})`)
            await loyaltyService.adjustPoints(
                customerId,
                pointsToRedeem,
                "refund",
                `Refund of redeemed points for canceled order #${orderId}`,
                orderId
            )
        }

        // 3. Clawback earned points
        const settings = await loyaltyService.getSettings()
        const orderSubtotalBDT = (order.subtotal || 0) / 100
        const pointsEarned = Math.floor(orderSubtotalBDT * settings.points_per_bdt_earned)

        if (pointsEarned > 0) {
            console.log(`[Loyalty Subscriber] Clawback of ${pointsEarned} points from customer ${customerId} (Canceled Order: ${orderId})`)
            await loyaltyService.adjustPoints(
                customerId,
                -pointsEarned,
                "refund",
                `Clawback of earned points for canceled order #${orderId}`,
                orderId
            )
        }
    } catch (error: any) {
        console.error(`[Loyalty Subscriber] Error processing order.canceled: ${error.message}`)
    }
}

export const config: SubscriberConfig = {
    event: "order.canceled",
}
