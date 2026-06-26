import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import type LoyaltyModuleService from "../../../../modules/loyalty/service"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const { customer_id: customerId, points, description } = req.body as {
        customer_id: string
        points: number
        description?: string
    }

    if (!customerId || points === undefined || isNaN(points)) {
        return res.status(400).json({ message: "Invalid parameters" })
    }

    const loyaltyService: LoyaltyModuleService = req.scope.resolve(LOYALTY_MODULE)

    try {
        const result = await loyaltyService.adjustPoints(
            customerId,
            points,
            "admin_adjustment",
            description || "Admin manual adjustment",
            null
        )

        res.json({
            message: "Points adjusted successfully",
            ...result,
        })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to adjust points",
            error: error.message,
        })
    }
}
