import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import type LoyaltyModuleService from "../../../../modules/loyalty/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const loyaltyService: LoyaltyModuleService = req.scope.resolve(LOYALTY_MODULE)

    try {
        const history = await loyaltyService.listLoyaltyHistories({}, {
            order: { created_at: "DESC" },
        })

        const customerIds = history.map(h => h.customer_id).filter(Boolean)
        const uniqueCustomerIds = Array.from(new Set(customerIds))
        let customerMap: Record<string, any> = {}

        if (uniqueCustomerIds.length > 0) {
            const { data: customers } = await query.graph({
                entity: "customer",
                fields: ["id", "email", "first_name", "last_name"],
                filters: { id: uniqueCustomerIds },
            })
            
            customerMap = customers.reduce((acc: any, c: any) => {
                acc[c.id] = c
                return acc
            }, {})
        }

        const data = history.map(h => {
            const customer = customerMap[h.customer_id]
            return {
                id: h.id,
                customer_id: h.customer_id,
                points: h.points,
                type: h.type,
                description: h.description,
                order_id: h.order_id,
                created_at: h.created_at,
                email: customer?.email || "Unknown Customer",
                name: customer ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() : "Unknown Name",
            }
        })

        res.json({ history: data })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to fetch loyalty history",
            error: error.message,
        })
    }
}
