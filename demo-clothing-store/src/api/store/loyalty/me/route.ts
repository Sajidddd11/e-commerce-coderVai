import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import type LoyaltyModuleService from "../../../../modules/loyalty/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const customerId = (req as any).auth_context?.actor_id

    if (!customerId) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const loyaltyService: LoyaltyModuleService = req.scope.resolve(LOYALTY_MODULE)

    try {
        const [account, history, settings] = await Promise.all([
            loyaltyService.getOrCreateAccount(customerId),
            loyaltyService.listLoyaltyHistories(
                { customer_id: customerId },
                {
                    order: { created_at: "DESC" },
                }
            ),
            loyaltyService.getSettings()
        ])

        res.json({ account, history, settings })
    } catch (error: any) {
        res.status(500).json({
            message: "Error fetching loyalty details",
            error: error.message,
        })
    }
}
