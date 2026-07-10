import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FINANCE_MODULE } from "../../../../modules/finance"
import type FinanceModuleService from "../../../../modules/finance/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const financeService: FinanceModuleService = req.scope.resolve(FINANCE_MODULE)

    try {
        const expenses = await financeService.listExpenses({}, { relations: ["category"], take: 10000, order: { date: "DESC" } })
        res.json({ expenses })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to fetch expenses",
            error: error.message,
        })
    }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const { amount, description, date, category_id } = req.body as {
        amount: number
        description?: string
        date: string
        category_id: string
    }

    if (!amount || !date || !category_id) {
        return res.status(400).json({ message: "Fields 'amount', 'date', and 'category_id' are required" })
    }

    const financeService: FinanceModuleService = req.scope.resolve(FINANCE_MODULE)

    try {
        const expense = await financeService.createExpenses({
            amount: Number(amount),
            description,
            date: new Date(date),
            category_id,
        })
        res.json({ expense })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to record expense",
            error: error.message,
        })
    }
}
