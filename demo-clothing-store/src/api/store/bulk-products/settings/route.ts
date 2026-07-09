import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BULK_MODULE } from "../../../../modules/bulk"
import type BulkModuleService from "../../../../modules/bulk/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const bulkService: BulkModuleService = req.scope.resolve(BULK_MODULE)

    try {
        const settings = await bulkService.getSettings()
        
        res.json({
            settings: {
                phone_enabled: settings.phone_enabled,
                phone_number: settings.phone_enabled ? settings.phone_number : null,
                whatsapp_enabled: settings.whatsapp_enabled,
                whatsapp_number: settings.whatsapp_enabled ? settings.whatsapp_number : null,
                whatsapp_message: settings.whatsapp_enabled ? settings.whatsapp_message : null,
                email_enabled: settings.email_enabled,
                email_address: settings.email_enabled ? settings.email_address : null,
                livechat_enabled: settings.livechat_enabled,
                livechat_provider: settings.livechat_enabled ? settings.livechat_provider : null,
                livechat_crisp_id: (settings.livechat_enabled && settings.livechat_provider === "crisp") ? settings.livechat_crisp_id : null,
                livechat_tawk_property_id: (settings.livechat_enabled && settings.livechat_provider === "tawk.to") ? settings.livechat_tawk_property_id : null,
                livechat_tawk_widget_id: (settings.livechat_enabled && settings.livechat_provider === "tawk.to") ? settings.livechat_tawk_widget_id : null,
            }
        })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to fetch public settings",
            error: error.message,
        })
    }
}
