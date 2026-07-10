import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BULK_MODULE } from "../../../../modules/bulk"
import type BulkModuleService from "../../../../modules/bulk/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const bulkService: BulkModuleService = req.scope.resolve(BULK_MODULE)

    try {
        const settings = await bulkService.getSettings()
        res.json({ settings })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to fetch settings",
            error: error.message,
        })
    }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const data = req.body as any

    const bulkService: BulkModuleService = req.scope.resolve(BULK_MODULE)

    try {
        await bulkService.updateSettings({
            phone_enabled: data.phone_enabled,
            phone_number: data.phone_number,
            whatsapp_enabled: data.whatsapp_enabled,
            whatsapp_number: data.whatsapp_number,
            whatsapp_message: data.whatsapp_message,
            email_enabled: data.email_enabled,
            email_address: data.email_address,
            livechat_enabled: data.livechat_enabled,
            livechat_provider: data.livechat_provider,
            livechat_crisp_id: data.livechat_crisp_id,
            livechat_tawk_property_id: data.livechat_tawk_property_id,
            livechat_tawk_widget_id: data.livechat_tawk_widget_id,
            sms_notifier_enabled: data.sms_notifier_enabled,
            sms_notifier_numbers: data.sms_notifier_numbers,
            sms_notifier_time: data.sms_notifier_time,
            sms_notifier_last_sent: data.sms_notifier_last_sent,
        })

        const settings = await bulkService.getSettings()
        res.json({
            message: "Settings updated successfully",
            settings,
        })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to update settings",
            error: error.message,
        })
    }
}
