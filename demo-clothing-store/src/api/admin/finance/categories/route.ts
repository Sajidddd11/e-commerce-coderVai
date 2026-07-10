import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FINANCE_MODULE } from "../../../../modules/finance"
import type FinanceModuleService from "../../../../modules/finance/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const financeService: FinanceModuleService = req.scope.resolve(FINANCE_MODULE)

    try {
        const categories = await financeService.listExpenseCategories({}, { take: 1000 })
        res.json({ categories })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to fetch categories",
            error: error.message,
        })
    }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const { name, description } = req.body as {
        name: string
        description?: string
    }

    if (!name) {
        return res.status(400).json({ message: "Category 'name' is required" })
    }

    const financeService: FinanceModuleService = req.scope.resolve(FINANCE_MODULE)

    try {
        const category = await financeService.createExpenseCategories({
            name,
            description,
        })
        res.json({ category })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to create category",
            error: error.message,
        })
    }
}
