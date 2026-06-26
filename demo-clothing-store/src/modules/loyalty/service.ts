import { MedusaService } from "@medusajs/framework/utils"
import LoyaltyAccount from "./models/loyalty-account"
import LoyaltyHistory from "./models/loyalty-history"
import LoyaltySetting from "./models/loyalty-setting"

class LoyaltyModuleService extends MedusaService({
    LoyaltyAccount,
    LoyaltyHistory,
    LoyaltySetting,
}) {
    /**
     * Get or create loyalty account for a customer
     */
    async getOrCreateAccount(customerId: string): Promise<any> {
        let account = await this.listLoyaltyAccounts({ customer_id: customerId }).then(res => res[0])
        if (!account) {
            account = await this.createLoyaltyAccounts({
                customer_id: customerId,
                points: 0,
            })
        }
        return account
    }

    /**
     * Adjust customer points balance and log to history.
     * Uses transaction-like flow or standard save.
     */
    async adjustPoints(
        customerId: string,
        points: number,
        type: "earn" | "redeem" | "admin_adjustment" | "refund",
        description: string,
        orderId?: string | null
    ): Promise<any> {
        const pointsInt = Math.floor(points)
        if (pointsInt === 0) return

        const account = await this.getOrCreateAccount(customerId)
        const currentPoints = account.points || 0
        const newPoints = Math.max(0, currentPoints + pointsInt)

        // Update the account balance
        await this.updateLoyaltyAccounts({
            id: account.id,
            points: newPoints,
        })

        // Log history entry
        const history = await this.createLoyaltyHistories({
            customer_id: customerId,
            points: pointsInt,
            type,
            description,
            order_id: orderId || null,
        })

        return {
            account: { ...account, points: newPoints },
            history,
        }
    }

    /**
     * Retrieve current loyalty configuration settings with fallback defaults
     */
    async getSettings(): Promise<{ points_per_bdt_earned: number; points_per_bdt_discount: number }> {
        const settings = await this.listLoyaltySettings()
        const earnSetting = settings.find(s => s.key === "points_per_bdt_earned")
        const discountSetting = settings.find(s => s.key === "points_per_bdt_discount")

        const earnRate = earnSetting ? parseFloat(earnSetting.value) : 1
        const discountRate = discountSetting ? parseFloat(discountSetting.value) : 100

        return {
            points_per_bdt_earned: Math.max(0, isNaN(earnRate) ? 1 : earnRate),
            points_per_bdt_discount: Math.max(1, isNaN(discountRate) ? 100 : discountRate),
        }
    }

    /**
     * Set configuration values
     */
    async updateSettings(data: { points_per_bdt_earned?: number; points_per_bdt_discount?: number }): Promise<any> {
        const results: any[] = []

        if (data.points_per_bdt_earned !== undefined) {
            const val = Math.floor(data.points_per_bdt_earned)
            const key = "points_per_bdt_earned"
            const existing = await this.listLoyaltySettings({ key }).then(res => res[0])
            if (existing) {
                results.push(await this.updateLoyaltySettings({ key, value: String(val) }))
            } else {
                results.push(await this.createLoyaltySettings({ key, value: String(val) }))
            }
        }

        if (data.points_per_bdt_discount !== undefined) {
            const val = Math.floor(data.points_per_bdt_discount)
            const key = "points_per_bdt_discount"
            const existing = await this.listLoyaltySettings({ key }).then(res => res[0])
            if (existing) {
                results.push(await this.updateLoyaltySettings({ key, value: String(val) }))
            } else {
                results.push(await this.createLoyaltySettings({ key, value: String(val) }))
            }
        }

        return results
    }
}

export default LoyaltyModuleService
