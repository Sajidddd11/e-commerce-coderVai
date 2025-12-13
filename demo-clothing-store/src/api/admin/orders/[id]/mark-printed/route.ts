import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const { id } = req.params
        const orderModuleService = req.scope.resolve(Modules.ORDER)

        // Get the current order
        const order = await orderModuleService.retrieveOrder(id)

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            })
        }

        // Update order metadata with printed timestamp
        const updatedOrder = await orderModuleService.updateOrders(id, {
            metadata: {
                ...order.metadata,
                printed_at: new Date().toISOString(),
            },
        })

        return res.status(200).json({
            order: updatedOrder,
            message: "Order marked as printed",
        })
    } catch (error: any) {
        console.error("Error marking order as printed:", error)
        return res.status(500).json({
            message: error?.message ?? "Failed to mark order as printed",
        })
    }
}
