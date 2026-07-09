import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * GET /store/reviews/product/:product_id/eligibility
 *
 * Returns whether the authenticated customer can review this product
 * (i.e. they have a delivered or refunded order containing it).
 *
 * Response:
 *   { eligible: boolean, order_id?: string, order_display_id?: number }
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const customerId: string | undefined = (req as any).auth_context?.actor_id

        if (!customerId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const { product_id } = req.params

        const orderModuleService = req.scope.resolve(Modules.ORDER)

        // Fetch all orders for this customer (with items + metadata)
        let allOrders: any[] = []
        try {
            const result = await orderModuleService.listOrders(
                { customer_id: customerId } as any,
                {
                    relations: ["items"],
                    order: { created_at: "DESC" },
                    take: 100,
                } as any
            )
            allOrders = Array.isArray(result)
                ? result
                : (result as any)?.data ?? []
        } catch {
            allOrders = []
        }

        const ELIGIBLE_STATUSES = ["delivered", "refunded"]

        // Find the first eligible order that contains this product
        const eligibleOrder = allOrders.find((order: any) => {
            const status: string =
                order.metadata?.custom_status || order.status || ""
            if (!ELIGIBLE_STATUSES.includes(status)) return false

            const items: any[] = order.items ?? []
            return items.some(
                (item: any) =>
                    item.product_id === product_id ||
                    item.variant?.product_id === product_id
            )
        })

        if (eligibleOrder) {
            return res.json({
                eligible: true,
                order_id: eligibleOrder.id,
                order_display_id: eligibleOrder.display_id,
            })
        }

        return res.json({ eligible: false })
    } catch (error: any) {
        return res.status(500).json({
            message: error?.message || "Failed to check review eligibility",
        })
    }
}
