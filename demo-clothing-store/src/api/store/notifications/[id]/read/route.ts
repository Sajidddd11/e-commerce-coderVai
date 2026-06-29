import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_NOTIFICATION_MODULE } from "~/modules/customer-notification"
import type CustomerNotificationModuleService from "~/modules/customer-notification/service"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const customerId = (req as any).auth_context?.actor_id
    const { id } = req.params

    if (!customerId) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    try {
        // Keep resolve inside try-catch — if the module isn't registered it throws
        // a non-MedusaError which would escape to Medusa's global error handler
        const notificationService: CustomerNotificationModuleService =
            req.scope.resolve(CUSTOMER_NOTIFICATION_MODULE)

        // In Medusa v2, retrieve() throws when the record is not found (does not return null)
        let notification: any
        try {
            notification = await notificationService.retrieveCustomerNotification(id)
        } catch {
            return res.status(404).json({ message: "Notification not found" })
        }

        if (notification.customer_id !== customerId) {
            return res.status(404).json({ message: "Notification not found" })
        }

        await notificationService.updateCustomerNotifications({
            id,
            status: "read" as const,
        })

        // Do NOT return the raw MikroORM entity — serialising it can produce
        // inconsistent output (Proxy objects / circular refs) that breaks the
        // response and makes the SDK throw "An unknown error occurred."
        res.json({ success: true })
    } catch (error: any) {
        console.error("[Notifications] markAsRead error:", error)
        res.status(500).json({
            message: "Error marking notification as read",
            error: error.message ?? String(error),
        })
    }
}
