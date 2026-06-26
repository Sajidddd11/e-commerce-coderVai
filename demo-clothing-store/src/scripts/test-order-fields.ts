import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function testOrderFields({ container }: ExecArgs) {
    const logger = container.resolve("logger")
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const orderId = "order_01KW27F6BC8W6XHS0P9KGW18SB" // The order we found in db
    
    try {
        const { data: orders } = await query.graph({
            entity: "order",
            fields: ["id", "customer_id", "subtotal", "total", "metadata", "items.unit_price", "items.quantity"],
            filters: { id: orderId },
        })
        
        logger.info(`Order data: ${JSON.stringify(orders[0], null, 2)}`)
    } catch (error: any) {
        logger.error(`Error querying order: ${error.message}`)
    }
}
