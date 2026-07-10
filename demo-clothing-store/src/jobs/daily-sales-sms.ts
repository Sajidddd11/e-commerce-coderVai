import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { BULK_MODULE } from "../modules/bulk"
import { FINANCE_MODULE } from "../modules/finance"
import type BulkModuleService from "../modules/bulk/service"
import type FinanceModuleService from "../modules/finance/service"
import { getBulkSmsClient } from "../lib/sms/bulk-sms-bd"

export default async function dailySalesSmsJob(container: MedusaContainer) {
    const bulkService: BulkModuleService = container.resolve(BULK_MODULE)

    // 1. Fetch notifier settings
    let settings
    try {
        settings = await bulkService.getSettings()
    } catch (e: any) {
        console.error("[Daily Sales SMS Job] Failed to read settings:", e.message)
        return
    }

    if (!settings.sms_notifier_enabled || !settings.sms_notifier_numbers) {
        return
    }

    // 2. Determine current time in Bangladesh (Asia/Dhaka) timezone
    const now = new Date()
    let localTimeStr = ""
    let todayDateStr = ""
    try {
        localTimeStr = now.toLocaleTimeString("en-US", { hour12: false, timeZone: "Asia/Dhaka" })
        todayDateStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }) // YYYY-MM-DD
    } catch (e: any) {
        console.error("[Daily Sales SMS Job] Timezone formatting error:", e.message)
        return
    }

    const [nowHour, nowMin] = localTimeStr.split(":")
    const currentTime = `${nowHour}:${nowMin}`

    // 3. Time comparison
    if (currentTime !== settings.sms_notifier_time) {
        return
    }

    // 4. Ensure we only send once per day
    if (settings.sms_notifier_last_sent === todayDateStr) {
        return
    }

    console.log(`[Daily Sales SMS Job] Triggering daily sales notification at ${currentTime}...`)

    try {
        const orderModuleService = container.resolve(Modules.ORDER) as any
        const financeService: FinanceModuleService = container.resolve(FINANCE_MODULE)

        const startOfDay = new Date(todayDateStr + "T00:00:00")
        const endOfDay = new Date(todayDateStr + "T23:59:59")

        // 5. Query today's orders
        const [orders] = await orderModuleService.listAndCountOrders(
            {
                created_at: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            },
            {
                take: 10000,
                skip: 0,
                relations: ["summary", "items"]
            }
        )

        const EXCLUDED_STATUSES = new Set(["canceled", "cancelled", "refunded"])
        const revenueOrders = orders.filter((o: any) => {
            const status: string = o.metadata?.custom_status || o.status || ""
            return !EXCLUDED_STATUSES.has(status)
        })

        const getTotal = (order: any): number => {
            const raw = order.summary?.current_order_total ?? order.summary?.accounting_total ?? order.total ?? 0
            return Number(raw) || 0
        }
        const totalRevenue = revenueOrders.reduce((sum, o) => sum + getTotal(o), 0)

        // 6. Calculate COGS
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

        // 7. Calculate today's manual expenses
        let expenses = await financeService.listExpenses({}, { relations: ["category"], take: 10000 })
        expenses = expenses.filter((e: any) => {
            const d = new Date(e.date)
            return d >= startOfDay && d <= endOfDay
        })
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

        const netProfit = totalRevenue - totalCogs - totalExpenses

        // 8. Compose report body
        const storeName = process.env.SMSNETBD_BRAND_NAME || "ZAHAN"
        const message = `[${storeName}] Daily Sales Report (${todayDateStr})
Orders: ${revenueOrders.length}
Revenue: BDT ${totalRevenue.toLocaleString()}
COGS: BDT ${totalCogs.toLocaleString()}
Expenses: BDT ${totalExpenses.toLocaleString()}
Net Profit: BDT ${netProfit.toLocaleString()}`

        // 9. Send SMS
        const numbers = settings.sms_notifier_numbers.split(",").map(n => n.trim()).filter(Boolean)
        const client = getBulkSmsClient()

        for (const num of numbers) {
            try {
                await client.send({ numbers: num, message })
                console.log(`[Daily Sales SMS Job] Successfully sent report to ${num}`)
            } catch (err: any) {
                console.error(`[Daily Sales SMS Job] Failed to send to ${num}:`, err.message)
            }
        }

        // 10. Update last sent timestamp
        await bulkService.updateSettings({ sms_notifier_last_sent: todayDateStr })
        console.log(`[Daily Sales SMS Job] Completed. Updated last sent date to ${todayDateStr}`)

    } catch (e: any) {
        console.error("[Daily Sales SMS Job] Failed execution:", e.message)
    }
}

export const config = {
    name: "daily-sales-sms",
    schedule: "* * * * *", // Run every minute to check exact HH:MM match
}
