
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    try {
        const { data: promotions } = await query.graph({
            entity: "promotion",
            fields: ["status", "code", "is_automatic", "rules.*", "rules.values.*"],
            filters: {
                code: ["FREE_SHIPPING_TIER_1", "FREE"], // Try both codes just in case
                is_automatic: true,
            },
        })

        const activePromotions = promotions.filter((p: any) => p.status === "active")

        if (!activePromotions.length) {
            return res.json({ threshold: null }) // No active free shipping promo found
        }

        // Find the first promotion that has an 'item_total' rule
        let threshold = 3000 // Default fallback

        for (const promo of activePromotions) {
            const rule = promo.rules?.find((r: any) => r.attribute === "item_total")
            if (rule && rule.values?.length) {
                // Values can be objects or strings depending on how they were saved/retrieved
                const val = rule.values[0]
                const valueStr = typeof val === 'object' && val !== null && 'value' in val ? val.value : val

                const parsed = parseInt(valueStr as string)
                if (!isNaN(parsed)) {
                    threshold = parsed
                    break // Found it
                }
            }
        }

        res.json({ threshold })
    } catch (error) {
        console.error("Error fetching free shipping threshold:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}
