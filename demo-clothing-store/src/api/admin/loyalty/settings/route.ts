import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import type LoyaltyModuleService from "../../../../modules/loyalty/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const loyaltyService: LoyaltyModuleService = req.scope.resolve(LOYALTY_MODULE)

    try {
        const settings = await loyaltyService.getSettings()
        res.json({ settings })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to fetch settings",
            error: error.message,
        })
    }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const { points_per_bdt_earned, points_per_bdt_discount } = req.body as {
        points_per_bdt_earned?: number
        points_per_bdt_discount?: number
    }

    const loyaltyService: LoyaltyModuleService = req.scope.resolve(LOYALTY_MODULE)

    try {
        await loyaltyService.updateSettings({
            points_per_bdt_earned,
            points_per_bdt_discount,
        })

        const settings = await loyaltyService.getSettings()
        res.json({
            message: "Settings updated successfully",
            settings,
        })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to update settings",
            error: error.message,
        })
    }
}
