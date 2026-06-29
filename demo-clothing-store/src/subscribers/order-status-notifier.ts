import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { CUSTOMER_NOTIFICATION_MODULE } from "../modules/customer-notification"
import type CustomerNotificationModuleService from "../modules/customer-notification/service"

export default async function orderStatusNotifierSubscriber({
    event: { data, name },
    container,
}: SubscriberArgs<{ id: string }>) {
    const orderId = data.id

    try {
        const query = container.resolve(ContainerRegistrationKeys.QUERY)
        const notificationService: CustomerNotificationModuleService = container.resolve(CUSTOMER_NOTIFICATION_MODULE)

        // 1. Fetch order details
        const { data: orders } = await query.graph({
            entity: "order",
            fields: [
                "id",
                "display_id",
                "customer_id",
                "status",
                "fulfillment_status",
                "payment_status",
                "metadata",
            ],
            filters: { id: orderId },
        })

        const order = orders?.[0] as any
        if (!order || !order.customer_id) {
            return
        }

        const customerId = order.customer_id
        let title = ""
        let message = ""

        const status = order.status
        const fulfillmentStatus = order.fulfillment_status
        const paymentStatus = order.payment_status

        // Map status combo to user-friendly titles & messages
        if (status === "canceled") {
            title = "Order Cancelled"
            message = `Your order #${order.display_id} has been cancelled.`
        } else if (paymentStatus === "refunded") {
            title = "Order Refunded"
            message = `Your payment for order #${order.display_id} has been refunded.`
        } else if (fulfillmentStatus === "shipped" || fulfillmentStatus === "partially_shipped") {
            title = "Order Shipped"
            message = `Your order #${order.display_id} has been shipped and is on the way!`
        } else if (status === "completed" || fulfillmentStatus === "delivered") {
            title = "Order Delivered"
            message = `Your order #${order.display_id} has been delivered successfully. Thank you!`
        } else if (fulfillmentStatus === "fulfilled" || fulfillmentStatus === "partially_fulfilled") {
            title = "Order Preparing"
            message = `Your order #${order.display_id} is now being prepared.`
        } else if (status === "pending" || name === "order.placed") {
            title = "Order Placed"
            message = `Your order #${order.display_id} has been placed successfully.`
        } else {
            // No matching status transition worth notifying in-app
            return
        }

        // Avoid creating duplicate notification messages for the same order & status type
        const existing = await notificationService.listCustomerNotifications({
            customer_id: customerId,
            order_id: orderId,
            title: title,
        })

        if (existing.length === 0) {
            console.log(`[Customer Notification] Creating "${title}" for customer ${customerId} (Order ${orderId})`)
            await notificationService.createCustomerNotifications({
                customer_id: customerId,
                order_id: orderId,
                title: title,
                message: message,
                type: "order_status",
                status: "unread",
            })
        }
    } catch (error: any) {
        console.error(`[Order Status Notifier Subscriber] Error processing event ${name}: ${error.message}`)
    }
}

export const config: SubscriberConfig = {
    event: [
        "order.placed",
        "order.updated",
        "order.canceled",
    ],
}
