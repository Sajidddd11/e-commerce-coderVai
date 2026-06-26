import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import type LoyaltyModuleService from "../../../../modules/loyalty/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const loyaltyService: LoyaltyModuleService = req.scope.resolve(LOYALTY_MODULE)

    try {
        const accounts = await loyaltyService.listLoyaltyAccounts({}, {
            order: { points: "DESC" },
        })

        const customerIds = accounts.map(a => a.customer_id).filter(Boolean)
        let customerMap: Record<string, any> = {}

        if (customerIds.length > 0) {
            const { data: customers } = await query.graph({
                entity: "customer",
                fields: ["id", "email", "first_name", "last_name"],
                filters: { id: customerIds },
            })
            
            customerMap = customers.reduce((acc: any, c: any) => {
                acc[c.id] = c
                return acc
            }, {})
        }

        const data = accounts.map(account => {
            const customer = customerMap[account.customer_id]
            return {
                id: account.id,
                customer_id: account.customer_id,
                points: account.points,
                email: customer?.email || "Unknown Customer",
                name: customer ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() : "Unknown Name",
            }
        })

        res.json({ customers: data })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to fetch loyalty customers",
            error: error.message,
        })
    }
}
