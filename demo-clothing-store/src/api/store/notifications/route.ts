import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_NOTIFICATION_MODULE } from "~/modules/customer-notification"
import type CustomerNotificationModuleService from "~/modules/customer-notification/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const customerId = (req as any).auth_context?.actor_id

    if (!customerId) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const notificationService: CustomerNotificationModuleService = req.scope.resolve(CUSTOMER_NOTIFICATION_MODULE)

    try {
        const notifications = await notificationService.listCustomerNotifications(
            { customer_id: customerId },
            {
                order: { created_at: "DESC" },
                take: 50,
            }
        )

        res.json({ notifications })
    } catch (error: any) {
        res.status(500).json({
            message: "Error fetching notifications",
            error: error.message,
        })
    }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const customerId = (req as any).auth_context?.actor_id

    if (!customerId) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const notificationService: CustomerNotificationModuleService = req.scope.resolve(CUSTOMER_NOTIFICATION_MODULE)

    try {
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
        res.status(500).json({
            message: "Error marking all notifications as read",
            error: error.message,
        })
    }
}
