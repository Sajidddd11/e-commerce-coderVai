import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_NOTIFICATION_MODULE } from "~/modules/customer-notification"
import type CustomerNotificationModuleService from "~/modules/customer-notification/service"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const customerId = (req as any).auth_context?.actor_id
    const { id } = req.params

    if (!customerId) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const notificationService: CustomerNotificationModuleService = req.scope.resolve(CUSTOMER_NOTIFICATION_MODULE)

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

    try {
        await notificationService.updateCustomerNotifications({
            id,
            status: "read" as const,
        })
        // Do NOT serialize the raw MikroORM entity — it contains Proxy objects
        // that corrupt res.json() and cause the SDK to throw "An unknown error occurred"
        res.json({ success: true })
    } catch (error: any) {
        res.status(500).json({
            message: "Error marking notification as read",
            error: error.message,
        })
    }
}
