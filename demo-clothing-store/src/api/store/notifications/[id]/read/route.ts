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

    try {
        const notification = await notificationService.retrieveCustomerNotification(id)

        if (!notification || notification.customer_id !== customerId) {
            return res.status(404).json({ message: "Notification not found" })
        }

        const updated = await notificationService.updateCustomerNotifications({
            id,
            status: "read" as const,
        })

        res.json({ success: true, notification: updated })
    } catch (error: any) {
        res.status(500).json({
            message: "Error marking notification as read",
            error: error.message,
        })
    }
}
