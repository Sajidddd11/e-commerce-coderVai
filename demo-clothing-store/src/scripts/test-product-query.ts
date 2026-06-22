import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function myScript({ container }: { container: MedusaContainer }) {
    console.log("Running test specific product query...")
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    
    const { data: products } = await query.graph({
        entity: "product",
        fields: [
            "id",
            "collection_id",
            "categories.id"
        ],
    })
    
    console.log(JSON.stringify(products[0], null, 2))
}
