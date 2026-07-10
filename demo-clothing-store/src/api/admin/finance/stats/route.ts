import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { FINANCE_MODULE } from "../../../../modules/finance"
import type FinanceModuleService from "../../../../modules/finance/service"

const EXCLUDED_STATUSES = new Set(["canceled", "cancelled", "refunded"])

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const startDateParam = req.query.start_date as string | undefined
    const endDateParam   = req.query.end_date   as string | undefined

    const financeService: FinanceModuleService = req.scope.resolve(FINANCE_MODULE)
    const orderModuleService = req.scope.resolve(Modules.ORDER) as any

    try {
        // 1. Set up filters for date range directly in the DB query
        const orderFilters: any = {}
        if (startDateParam || endDateParam) {
            orderFilters.created_at = {}
            if (startDateParam) {
                orderFilters.created_at.$gte = new Date(startDateParam + "T00:00:00")
            }
            if (endDateParam) {
                orderFilters.created_at.$lte = new Date(endDateParam + "T23:59:59")
            }
        }

        // Fetch orders with relations
        const [orders] = await orderModuleService.listAndCountOrders(
            orderFilters,
            {
                take: 10000,
                skip: 0,
                order: { created_at: "DESC" },
                relations: ["summary", "items"],
            }
        )

        // 2. Filter orders by status
        let filteredOrders = orders

        const revenueOrders = filteredOrders.filter((o: any) => {
            const status: string = o.metadata?.custom_status || o.status || ""
            return !EXCLUDED_STATUSES.has(status)
        })

        // 3. Calculate Revenue
        const getTotal = (order: any): number => {
            const raw =
                order.summary?.current_order_total ??
                order.summary?.accounting_total ??
                order.total ??
                0
            return Number(raw) || 0
        }
        const totalRevenue = revenueOrders.reduce((sum, o) => sum + getTotal(o), 0)

        // 4. Fetch variant buying prices & calculate COGS
        const buyingPrices = await financeService.listVariantBuyingPrices({}, { take: 10000 })
        const priceMap = new Map(buyingPrices.map(bp => [bp.variant_id, bp.buying_price]))

        let totalCogs = 0
        revenueOrders.forEach((order: any) => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                    if (item.variant_id) {
                        const buyingPrice = priceMap.get(item.variant_id) || 0
                        totalCogs += (item.quantity * buyingPrice)
                    }
                })
            }
        })

        // 5. Fetch and filter expenses
        let expenses = await financeService.listExpenses({}, { relations: ["category"], take: 10000 })
        if (startDateParam || endDateParam) {
            const rangeStart = startDateParam ? new Date(startDateParam + "T00:00:00") : null
            const rangeEnd   = endDateParam   ? new Date(endDateParam   + "T23:59:59") : null
            expenses = expenses.filter((e: any) => {
                const d = new Date(e.date)
                if (rangeStart && d < rangeStart) return false
                if (rangeEnd && d > rangeEnd) return false
                return true
            })
        }

        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

        // 6. Aggregate expenses by category for breakdown charts
        const categoryBreakdown: Record<string, { id: string; name: string; amount: number }> = {}
        expenses.forEach((e: any) => {
            const catName = e.category?.name || "Uncategorized"
            const catId = e.category?.id || "uncategorized"
            if (!categoryBreakdown[catId]) {
                categoryBreakdown[catId] = { id: catId, name: catName, amount: 0 }
            }
            categoryBreakdown[catId].amount += e.amount
        })

        // 7. Calculate Net Profit
        const netProfit = totalRevenue - totalCogs - totalExpenses

        res.json({
            stats: {
                revenue: totalRevenue,
                cogs: totalCogs,
                expenses: totalExpenses,
                profit: netProfit,
                category_breakdown: Object.values(categoryBreakdown),
            }
        })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to fetch stats",
            error: error.message,
        })
    }
}
