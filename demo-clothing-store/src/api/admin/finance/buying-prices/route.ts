import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FINANCE_MODULE } from "../../../../modules/finance"
import type FinanceModuleService from "../../../../modules/finance/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const financeService: FinanceModuleService = req.scope.resolve(FINANCE_MODULE)

    try {
        const prices = await financeService.listVariantBuyingPrices({}, { take: 10000 })
        res.json({ prices })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to fetch variant buying prices",
            error: error.message,
        })
    }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const { prices } = req.body as {
        prices: { variant_id: string; buying_price: number }[]
    }

    if (!Array.isArray(prices)) {
        return res.status(400).json({ message: "Invalid payload: 'prices' must be an array" })
    }

    const financeService: FinanceModuleService = req.scope.resolve(FINANCE_MODULE)

    try {
        // Fetch existing prices to partition into create vs update
        const existingPrices = await financeService.listVariantBuyingPrices(
            { variant_id: prices.map(p => p.variant_id) },
            { take: 10000 }
        )
        const existingIds = new Set(existingPrices.map(ep => ep.variant_id))

        const toCreate: { variant_id: string; buying_price: number }[] = []
        const toUpdate: { variant_id: string; buying_price: number }[] = []

        prices.forEach(p => {
            if (existingIds.has(p.variant_id)) {
                toUpdate.push(p)
            } else {
                toCreate.push(p)
            }
        })

        if (toCreate.length > 0) {
            await financeService.createVariantBuyingPrices(toCreate)
        }
        if (toUpdate.length > 0) {
            await financeService.updateVariantBuyingPrices(toUpdate)
        }

        res.json({
            message: "Variant buying prices updated successfully",
            updated: toUpdate.length,
            created: toCreate.length,
        })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to update buying prices",
            error: error.message,
        })
    }
}
