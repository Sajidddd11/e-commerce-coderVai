import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FINANCE_MODULE } from "../../../../../modules/finance"
import type FinanceModuleService from "../../../../../modules/finance/service"

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const { id } = req.params
    const financeService: FinanceModuleService = req.scope.resolve(FINANCE_MODULE)

    try {
        await financeService.deleteExpenses(id)
        res.json({
            message: "Expense deleted successfully",
            id,
        })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to delete expense",
            error: error.message,
        })
    }
}
