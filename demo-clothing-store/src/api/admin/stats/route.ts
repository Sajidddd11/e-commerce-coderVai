import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

// ── Constants ────────────────────────────────────────────────────────────────
const EXCLUDED_STATUSES = new Set(["canceled", "cancelled", "refunded"])

const getProviderLabel = (providerId: string | null | undefined): string => {
    if (!providerId) return "Unknown"
    const id = providerId.toLowerCase()
    if (id.includes("sslcommerz")) return "SSLCommerz"
    if (id.includes("manual")) return "COD / Manual"
    if (id.includes("cod")) return "COD"
    if (id.includes("stripe")) return "Stripe"
    const match = id.match(/pp_(\w+)_/)
    if (match && match[1]) return match[1].charAt(0).toUpperCase() + match[1].slice(1)
    return "Other"
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    // ── Query params ─────────────────────────────────────────────────────────
    const startDateParam = req.query.start_date as string | undefined
    const endDateParam   = req.query.end_date   as string | undefined
    const trendDaysCount = Math.min(Math.max(parseInt((req.query.trend_days as string) || "30", 10), 1), 90)
    const topLimit       = Math.min(Math.max(parseInt((req.query.top_limit  as string) || "10", 10), 1), 50)
    try {
        const orderModuleService = req.scope.resolve(Modules.ORDER)
        const customerModuleService = req.scope.resolve(Modules.CUSTOMER)
        const userModuleService = req.scope.resolve(Modules.USER)
        const remoteQuery = req.scope.resolve("remoteQuery")

        // ── 1. Fetch ALL orders (try with items, fall back gracefully) ─────────
        let allOrders: any[] = []
        try {
            const [orders] = await orderModuleService.listAndCountOrders(
                {},
                {
                    take: 10000,
                    skip: 0,
                    order: { created_at: "DESC" },
                    relations: ["summary", "items"],
                }
            )
            allOrders = orders
        } catch (_) {
            try {
                const [orders] = await orderModuleService.listAndCountOrders(
                    {},
                    {
                        take: 10000,
                        skip: 0,
                        order: { created_at: "DESC" },
                        relations: ["summary"],
                    }
                )
                allOrders = orders
            } catch (_2) {
                const [orders] = await orderModuleService.listAndCountOrders(
                    {},
                    { take: 10000, skip: 0, order: { created_at: "DESC" } }
                )
                allOrders = orders
            }
        }

        // ── 1b. Apply date-range filter if provided ───────────────────────────
        if (startDateParam || endDateParam) {
            const rangeStart = startDateParam ? new Date(startDateParam + "T00:00:00") : null
            const rangeEnd   = endDateParam   ? new Date(endDateParam   + "T23:59:59") : null
            allOrders = allOrders.filter((o) => {
                const d = new Date(o.created_at)
                if (rangeStart && d < rangeStart) return false
                if (rangeEnd   && d > rangeEnd)   return false
                return true
            })
        }

        // ── 2. Fetch payment status + provider per order ───────────────────────
        let orderPaymentStatusMap: Record<string, string> = {}
        let orderPaymentProviderMap: Record<string, string> = {}
        try {
            const orderIds = allOrders.map((o) => o.id)
            if (orderIds.length > 0) {
                const paymentData = await remoteQuery({
                    entryPoint: "order_payment_collection",
                    fields: ["order_id", "payment_collection_id"],
                    variables: { filters: { order_id: orderIds } },
                })

                const paymentCollectionIds = paymentData
                    .map((p: any) => p.payment_collection_id)
                    .filter(Boolean)

                if (paymentCollectionIds.length > 0) {
                    const [paymentCollections, payments] = await Promise.all([
                        remoteQuery({
                            entryPoint: "payment_collection",
                            fields: ["id", "status"],
                            variables: { filters: { id: paymentCollectionIds } },
                        }),
                        remoteQuery({
                            entryPoint: "payment",
                            fields: ["id", "provider_id", "payment_collection_id"],
                            variables: {
                                filters: { payment_collection_id: paymentCollectionIds },
                            },
                        }),
                    ])

                    paymentData.forEach((link: any) => {
                        const pc = paymentCollections.find(
                            (c: any) => c.id === link.payment_collection_id
                        )
                        const payment = payments.find(
                            (p: any) => p.payment_collection_id === link.payment_collection_id
                        )
                        if (pc && link.order_id) {
                            orderPaymentStatusMap[link.order_id] = pc.status
                        }
                        if (payment && link.order_id) {
                            orderPaymentProviderMap[link.order_id] = payment.provider_id
                        }
                    })
                }
            }
        } catch (_) {
            // continue without payment data
        }

        // ── 3. Date helpers ───────────────────────────────────────────────────
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekStart = new Date(now)
        weekStart.setDate(weekStart.getDate() - 7)
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

        // ── 4. Core helpers ───────────────────────────────────────────────────
        const getTotal = (order: any): number => {
            const raw =
                order.summary?.current_order_total ??
                order.summary?.accounting_total ??
                order.total ??
                0
            return Number(raw) || 0
        }

        const isRevenueOrder = (order: any): boolean => {
            const status: string = order.metadata?.custom_status || order.status || ""
            return !EXCLUDED_STATUSES.has(status)
        }

        const revenueOrders = allOrders.filter(isRevenueOrder)

        // ── 5. Revenue across periods ─────────────────────────────────────────
        const totalRevenue = revenueOrders.reduce((sum, o) => sum + getTotal(o), 0)
        const todayRevenue = revenueOrders
            .filter((o) => new Date(o.created_at) >= todayStart)
            .reduce((sum, o) => sum + getTotal(o), 0)
        const thisMonthRevenue = revenueOrders
            .filter((o) => new Date(o.created_at) >= monthStart)
            .reduce((sum, o) => sum + getTotal(o), 0)
        const prevMonthRevenue = revenueOrders
            .filter((o) => {
                const d = new Date(o.created_at)
                return d >= prevMonthStart && d <= prevMonthEnd
            })
            .reduce((sum, o) => sum + getTotal(o), 0)
        const lastWeekRevenue = revenueOrders
            .filter((o) => new Date(o.created_at) >= weekStart)
            .reduce((sum, o) => sum + getTotal(o), 0)

        // ── 6. Order counts ───────────────────────────────────────────────────
        const totalOrders = allOrders.length
        const todayOrders = allOrders.filter(
            (o) => new Date(o.created_at) >= todayStart
        ).length
        const thisWeekOrders = allOrders.filter(
            (o) => new Date(o.created_at) >= weekStart
        ).length
        const thisMonthOrders = allOrders.filter(
            (o) => new Date(o.created_at) >= monthStart
        ).length

        // ── 7. Order status breakdown ─────────────────────────────────────────
        const STATUS_KEYS = [
            "pending", "processing", "shipped", "delivered",
            "canceled", "refunded", "completed",
        ] as const
        const orderStatusCounts: Record<string, number> = {}
        STATUS_KEYS.forEach((s) => (orderStatusCounts[s] = 0))
        allOrders.forEach((o) => {
            const status: string = o.metadata?.custom_status || o.status || "pending"
            orderStatusCounts[status] = (orderStatusCounts[status] ?? 0) + 1
        })

        // ── 8. Payment status breakdown ───────────────────────────────────────
        const paymentStatusCounts: Record<string, number> = {
            captured: 0, awaiting: 0, not_paid: 0, authorized: 0, canceled: 0,
        }
        allOrders.forEach((o) => {
            const ps = orderPaymentStatusMap[o.id] || "not_paid"
            paymentStatusCounts[ps] = (paymentStatusCounts[ps] ?? 0) + 1
        })

        // ── 9. Payment method split ───────────────────────────────────────────
        const pmSplitMap: Record<string, { count: number; revenue: number }> = {}
        allOrders.forEach((o) => {
            const label = getProviderLabel(orderPaymentProviderMap[o.id])
            if (!pmSplitMap[label]) pmSplitMap[label] = { count: 0, revenue: 0 }
            pmSplitMap[label].count++
            if (isRevenueOrder(o)) pmSplitMap[label].revenue += getTotal(o)
        })
        const paymentMethodSplit = Object.entries(pmSplitMap)
            .map(([method, data]) => ({ method, ...data }))
            .sort((a, b) => b.count - a.count)

        // ── 10. Top 5 products by revenue ────────────────────────────────────
        const productMap: Record<string, {
            title: string
            quantity: number
            revenue: number
            orders: Set<string>
        }> = {}
        allOrders.forEach((o) => {
            if (!isRevenueOrder(o)) return
            const items: any[] = o.items || []
            items.forEach((item: any) => {
                const key = item.product_id || item.variant_id || item.title || "unknown"
                const title =
                    item.product_title || item.title || "Unknown Product"
                if (!productMap[key]) {
                    productMap[key] = { title, quantity: 0, revenue: 0, orders: new Set() }
                }
                productMap[key].quantity += item.quantity || 0
                productMap[key].revenue +=
                    (item.unit_price || 0) * (item.quantity || 0)
                productMap[key].orders.add(o.id)
            })
        })
        const topProducts = Object.values(productMap)
            .map((p) => ({
                title: p.title,
                quantity: p.quantity,
                revenue: p.revenue,
                order_count: p.orders.size,
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, topLimit)

        // ── 11. Cancellation rate ─────────────────────────────────────────────
        const cancelledCount = allOrders.filter((o) => {
            const s = o.metadata?.custom_status || o.status || ""
            return s === "canceled" || s === "cancelled"
        }).length
        const cancellationRate =
            totalOrders > 0 ? (cancelledCount / totalOrders) * 100 : 0

        // ── 12. Repeat customer rate ──────────────────────────────────────────
        const customerOrderCount: Record<string, number> = {}
        allOrders.forEach((o) => {
            const key = o.email || o.customer_id
            if (key) customerOrderCount[key] = (customerOrderCount[key] || 0) + 1
        })
        const allUniqueCustomers = Object.keys(customerOrderCount).length
        const repeatCustomers = Object.values(customerOrderCount).filter(
            (c) => c > 1
        ).length
        const repeatCustomerRate =
            allUniqueCustomers > 0
                ? (repeatCustomers / allUniqueCustomers) * 100
                : 0

        // ── 13. Unfulfilled orders (pending > 24h) ────────────────────────────
        const unfulfilledOrders = allOrders.filter((o) => {
            const status = o.metadata?.custom_status || o.status
            if (status !== "pending") return false
            const hoursSince =
                (now.getTime() - new Date(o.created_at).getTime()) / (1000 * 60 * 60)
            return hoursSince > 24
        })
        const oldestHours =
            unfulfilledOrders.length > 0
                ? Math.round(
                    Math.max(
                        ...unfulfilledOrders.map(
                            (o) =>
                                (now.getTime() - new Date(o.created_at).getTime()) /
                                (1000 * 60 * 60)
                        )
                    )
                )
                : 0

        // ── 14. AOV ───────────────────────────────────────────────────────────
        const avgOrderValue =
            revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0

        // ── 15. Customer count ────────────────────────────────────────────────
        let totalCustomers = 0
        let newCustomersThisMonth = 0
        try {
            const [, count] = await customerModuleService.listAndCountCustomers(
                {},
                { take: 1, skip: 0 }
            )
            totalCustomers = count
            const [, newCount] = await customerModuleService.listAndCountCustomers(
                { created_at: { $gte: monthStart } } as any,
                { take: 1, skip: 0 }
            )
            newCustomersThisMonth = newCount
        } catch (_) {
            const uniqueEmails = new Set(
                allOrders.map((o) => o.email).filter(Boolean)
            )
            totalCustomers = uniqueEmails.size
        }

        // ── 16. Admin count ───────────────────────────────────────────────────
        let totalAdmins = 0
        try {
            const [, adminCount] = await userModuleService.listAndCountUsers(
                {},
                { take: 1, skip: 0 }
            )
            totalAdmins = adminCount
        } catch (_) { }

        // ── 17. Revenue trend (last N days per trend_days param) ──────────
        const revenueTrend: { date: string; revenue: number; orders: number }[] = []
        for (let i = trendDaysCount - 1; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
            const dayEnd = new Date(
                d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59
            )
            const dayOrders = revenueOrders.filter((o) => {
                const c = new Date(o.created_at)
                return c >= dayStart && c <= dayEnd
            })
            revenueTrend.push({
                date: dayStart.toISOString().split("T")[0],
                revenue: dayOrders.reduce((sum, o) => sum + getTotal(o), 0),
                orders: dayOrders.length,
            })
        }

        // ── 18. Revenue by day of week ────────────────────────────────────────
        const DOW_LABELS = [
            "Sunday", "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday",
        ]
        const dowData = DOW_LABELS.map((day) => ({ day, revenue: 0, orders: 0 }))
        revenueOrders.forEach((o) => {
            const dow = new Date(o.created_at).getDay()
            dowData[dow].revenue += getTotal(o)
            dowData[dow].orders++
        })

        // ── 19. Currency ──────────────────────────────────────────────────────
        const currency = allOrders[0]?.currency_code?.toUpperCase() || "BDT"

        return res.status(200).json({
            currency,
            revenue: {
                total: totalRevenue,
                today: todayRevenue,
                this_week: lastWeekRevenue,
                this_month: thisMonthRevenue,
                prev_month: prevMonthRevenue,
            },
            orders: {
                total: totalOrders,
                today: todayOrders,
                this_week: thisWeekOrders,
                this_month: thisMonthOrders,
                status_breakdown: orderStatusCounts,
                payment_status_breakdown: paymentStatusCounts,
            },
            customers: { total: totalCustomers, new_this_month: newCustomersThisMonth },
            admins: { total: totalAdmins },
            avg_order_value: avgOrderValue,
            revenue_trend: revenueTrend,
            // ── New fields ──
            cancellation_rate: Math.round(cancellationRate * 10) / 10,
            repeat_customer_rate: Math.round(repeatCustomerRate * 10) / 10,
            unfulfilled_orders: {
                count: unfulfilledOrders.length,
                oldest_hours: oldestHours,
            },
            payment_method_split: paymentMethodSplit,
            top_products: topProducts,
            revenue_by_dow: dowData,
        })
    } catch (error: any) {
        console.error("Stats API error:", error)
        return res.status(500).json({
            message: error?.message ?? "Failed to fetch stats",
        })
    }
}
