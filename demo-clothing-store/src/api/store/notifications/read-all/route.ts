import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_NOTIFICATION_MODULE } from "~/modules/customer-notification"
import type CustomerNotificationModuleService from "~/modules/customer-notification/service"

/**
 * POST /store/notifications/read-all
 * Marks every unread notification for the authenticated customer as read.
 * Called by the mobile app's markAllNotificationsAsRead().
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const customerId = (req as any).auth_context?.actor_id

    if (!customerId) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    try {
        // Keep resolve inside try-catch — if the module isn't registered it throws
        // a non-MedusaError which would otherwise escape to Medusa's global handler
        // and return {"code":"unknown_error","type":"unknown_error","message":"An unknown error occurred."}
        const notificationService: CustomerNotificationModuleService =
            req.scope.resolve(CUSTOMER_NOTIFICATION_MODULE)

        const notifications = await notificationService.listCustomerNotifications({
            customer_id: customerId,
            status: "unread",
        })

        if (notifications.length > 0) {
            await Promise.all(
                notifications.map((n) =>
                    notificationService.updateCustomerNotifications({
                        id: n.id,
                        status: "read" as const,
                    })
                )
            )
        }

        res.json({ success: true, count: notifications.length })
    } catch (error: any) {
        console.error("[Notifications] markAllAsRead error:", error)
        res.status(500).json({
            message: "Error marking all notifications as read",
            error: error.message ?? String(error),
        })
    }
}
