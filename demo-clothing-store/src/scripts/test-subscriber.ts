import { ExecArgs } from "@medusajs/framework/types"
import loyaltyOrderPlacedSubscriber from "../subscribers/loyalty-order-placed"

export default async function testSubscriber({ container }: ExecArgs) {
    const logger = container.resolve("logger")
    const orderId = "order_01KW27F6BC8W6XHS0P9KGW18SB" // The order placed today

    logger.info(`Manually triggering subscriber for order: ${orderId}...`)

    try {
        await loyaltyOrderPlacedSubscriber({
            event: {
                id: "test-event-id",
                name: "order.placed",
                data: { id: orderId },
                timestamp: new Date(),
            },
            container,
        } as any)
        
        logger.info("Subscriber execution finished successfully!")
    } catch (error: any) {
        logger.error(`Error running subscriber: ${error.message}`)
    }
}
