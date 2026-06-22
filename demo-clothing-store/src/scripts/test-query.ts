import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function myScript({ container }: { container: MedusaContainer }) {
    console.log("Running test query...")
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    
    const { data: orders } = await query.graph({
        entity: "order",
        fields: [
            "id",
            "items.id",
            "items.product_id",
            "items.product.collection_id",
            "items.product.categories.id",
            "items.product.categories.name"
        ],
    })
    
    console.log(JSON.stringify(orders[0]?.items, null, 2))
}
