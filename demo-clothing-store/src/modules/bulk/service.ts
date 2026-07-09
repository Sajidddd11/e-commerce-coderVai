import { MedusaService } from "@medusajs/framework/utils"
import BulkProduct from "./models/bulk-product"
import BulkSetting from "./models/bulk-setting"

class BulkModuleService extends MedusaService({
    BulkProduct,
    BulkSetting,
}) {
    /**
     * Retrieve all bulk contact settings with fallback defaults
     */
    async getSettings(): Promise<{
        phone_enabled: boolean
        phone_number: string
        whatsapp_enabled: boolean
        whatsapp_number: string
        whatsapp_message: string
        email_enabled: boolean
        email_address: string
        livechat_enabled: boolean
        livechat_provider: string
        livechat_crisp_id: string
        livechat_tawk_property_id: string
        livechat_tawk_widget_id: string
    }> {
        const settings = await this.listBulkSettings()
        
        const getVal = (key: string, fallback: string) => {
            const match = settings.find(s => s.key === key)
            return match ? match.value : fallback
        }

        const getBool = (key: string, fallback: boolean) => {
            const val = getVal(key, "")
            if (val === "true") return true
            if (val === "false") return false
            return fallback
        }

        return {
            phone_enabled: getBool("phone_enabled", true),
            phone_number: getVal("phone_number", "8801304117711"),
            whatsapp_enabled: getBool("whatsapp_enabled", true),
            whatsapp_number: getVal("whatsapp_number", "8801304117711"),
            whatsapp_message: getVal("whatsapp_message", "Hi, I'm interested in placing a bulk order from ZAHAN. Please share your bulk pricing details."),
            email_enabled: getBool("email_enabled", true),
            email_address: getVal("email_address", "info@zahan.com"),
            livechat_enabled: getBool("livechat_enabled", false),
            livechat_provider: getVal("livechat_provider", "tawk.to"),
            livechat_crisp_id: getVal("livechat_crisp_id", ""),
            livechat_tawk_property_id: getVal("livechat_tawk_property_id", ""),
            livechat_tawk_widget_id: getVal("livechat_tawk_widget_id", ""),
        }
    }

    /**
     * Update bulk contact settings
     */
    async updateSettings(data: Partial<{
        phone_enabled: boolean
        phone_number: string
        whatsapp_enabled: boolean
        whatsapp_number: string
        whatsapp_message: string
        email_enabled: boolean
        email_address: string
        livechat_enabled: boolean
        livechat_provider: string
        livechat_crisp_id: string
        livechat_tawk_property_id: string
        livechat_tawk_widget_id: string
    }>): Promise<any[]> {
        const results: any[] = []

        for (const [key, val] of Object.entries(data)) {
            if (val === undefined) continue
            const stringVal = typeof val === "boolean" ? String(val) : String(val)
            
            const existing = await this.listBulkSettings({ key }).then(res => res[0])
            if (existing) {
                results.push(await this.updateBulkSettings({ key, value: stringVal }))
            } else {
                results.push(await this.createBulkSettings({ key, value: stringVal }))
            }
        }

        return results
    }
}

export default BulkModuleService
