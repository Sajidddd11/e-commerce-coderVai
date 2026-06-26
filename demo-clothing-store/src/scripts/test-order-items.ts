import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function myScript({ container }: { container: MedusaContainer }) {
    console.log("Running order items test query...")
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    
    const { data: orders } = await query.graph({
        entity: "order",
        fields: [
            "id",
            "items.*",
        ],
    })
    if (orders && orders[0]) {
        console.log(JSON.stringify(orders[0]?.items?.[0], null, 2))
    }
}
