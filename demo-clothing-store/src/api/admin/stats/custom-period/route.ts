import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

const EXCLUDED_STATUSES = new Set(["canceled", "cancelled", "refunded"])

/**
 * GET /admin/stats/custom-period?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 * Lightweight endpoint for custom date-range revenue calculations.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const { start_date, end_date } = req.query

        if (!start_date || !end_date) {
            return res.status(400).json({
                message: "Both start_date and end_date query params are required (YYYY-MM-DD)",
            })
        }

        const startDate = new Date(String(start_date))
        const endDate = new Date(String(end_date))
        endDate.setHours(23, 59, 59, 999) // include the full end day

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." })
        }

        if (startDate > endDate) {
            return res.status(400).json({
                message: "start_date must be before or equal to end_date",
            })
        }

        const orderModuleService = req.scope.resolve(Modules.ORDER)

        // Fetch orders in the requested date range
        let orders: any[] = []
        try {
            const [result] = await orderModuleService.listAndCountOrders(
                { created_at: { $gte: startDate, $lte: endDate } } as any,
                {
                    take: 10000,
                    skip: 0,
                    order: { created_at: "DESC" },
                    relations: ["summary"],
                }
            )
            orders = result
        } catch (_) {
            const [result] = await orderModuleService.listAndCountOrders(
                { created_at: { $gte: startDate, $lte: endDate } } as any,
                { take: 10000, skip: 0, order: { created_at: "DESC" } }
            )
            orders = result
        }

        const getTotal = (order: any): number => {
            const raw =
                order.summary?.current_order_total ??
                order.summary?.accounting_total ??
                order.total ??
                0
            return Number(raw) || 0
        }

        const revenueOrders = orders.filter((o) => {
            const status: string = o.metadata?.custom_status || o.status || ""
            return !EXCLUDED_STATUSES.has(status)
        })

        const cancelledOrders = orders.filter((o) => {
            const s = o.metadata?.custom_status || o.status || ""
            return s === "canceled" || s === "cancelled"
        })

        const revenue = revenueOrders.reduce((sum, o) => sum + getTotal(o), 0)
        const avgOrderValue =
            revenueOrders.length > 0 ? revenue / revenueOrders.length : 0
        const currency = orders[0]?.currency_code?.toUpperCase() || "BDT"

        // Build daily breakdown for the period
        const days: { date: string; revenue: number; orders: number }[] = []
        const cursor = new Date(startDate)
        while (cursor <= endDate) {
            const dayStart = new Date(
                cursor.getFullYear(), cursor.getMonth(), cursor.getDate()
            )
            const dayEnd = new Date(
                cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), 23, 59, 59
            )
            const dayOrders = revenueOrders.filter((o) => {
                const c = new Date(o.created_at)
                return c >= dayStart && c <= dayEnd
            })
            days.push({
                date: dayStart.toISOString().split("T")[0],
                revenue: dayOrders.reduce((sum, o) => sum + getTotal(o), 0),
                orders: dayOrders.length,
            })
            cursor.setDate(cursor.getDate() + 1)
            // Safety: max 365 days
            if (days.length >= 365) break
        }

        return res.status(200).json({
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
            currency,
            revenue,
            total_orders: orders.length,
            revenue_orders: revenueOrders.length,
            cancelled_orders: cancelledOrders.length,
            avg_order_value: avgOrderValue,
            daily_breakdown: days,
        })
    } catch (error: any) {
        console.error("Custom period stats error:", error)
        return res.status(500).json({
            message: error?.message ?? "Failed to fetch custom period stats",
        })
    }
}
