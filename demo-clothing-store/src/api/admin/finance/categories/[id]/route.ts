import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FINANCE_MODULE } from "../../../../../modules/finance"
import type FinanceModuleService from "../../../../../modules/finance/service"

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const { id } = req.params
    const financeService: FinanceModuleService = req.scope.resolve(FINANCE_MODULE)

    try {
        await financeService.deleteExpenseCategories(id)
        res.json({
            message: "Category deleted successfully",
            id,
        })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to delete category",
            error: error.message,
        })
    }
}
