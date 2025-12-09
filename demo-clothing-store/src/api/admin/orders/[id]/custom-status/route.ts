import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

const VALID_CUSTOM_STATUSES = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'canceled',
    'refunded',
]

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const { id } = req.params
    const { customStatus } = req.body as { customStatus: string }

    if (!VALID_CUSTOM_STATUSES.includes(customStatus)) {
        return res.status(400).json({
            message: `Invalid status. Must be one of: ${VALID_CUSTOM_STATUSES.join(', ')}`
        })
    }

    const orderModuleService = req.scope.resolve(Modules.ORDER)
    const fulfillmentModuleService = req.scope.resolve(Modules.FULFILLMENT)
    const remoteQuery = req.scope.resolve("remoteQuery")

    try {
        // Get current order
        const order = await orderModuleService.retrieveOrder(id)

        // Get order items for fulfillment creation
        // Note: We'll skip fulfillment creation for now since line items require complex relation handling
        const orderItems: any[] = []

        let updateData: any = {
            metadata: {
                ...order.metadata,
                custom_status: customStatus
            }
        }

        // Handle status-specific updates
        switch (customStatus) {
            case 'shipped':
                // Just update metadata, don't try to create fulfillment
                // (Fulfillment creation requires complex setup with providers/locations)
                console.log(`Order ${id} marked as shipped`)
                break

            case 'delivered':
                updateData.status = 'archived' // Archive delivered orders
                console.log(`Order ${id} marked as delivered and archived`)
                break

            case 'canceled':
                updateData.status = 'canceled'
                updateData.canceled_at = new Date()
                console.log(`Order ${id} canceled`)
                break

            case 'refunded':
                updateData.status = 'archived'
                console.log(`Order ${id} marked as refunded and archived`)
                break

            // 'pending' and 'processing' don't need special handling
        }

        // Update order
        const updatedOrder = await orderModuleService.updateOrders(id, updateData)

        return res.json({ order: updatedOrder })
    } catch (error: any) {
        console.error('Error updating order status:', error)
        return res.status(500).json({
            message: error?.message ?? 'Failed to update order status'
        })
    }
}

// Helper: Handle shipped status
async function handleShippedStatus(orderId: string, orderItems: any[], fulfillmentService: any, remoteQuery: any) {
    // Get existing fulfillments
    const fulfillments = await getFulfillments(orderId, remoteQuery)

    if (fulfillments.length === 0) {
        // Get a stock location (required for fulfillment)
        const locations = await remoteQuery({
            entryPoint: "stock_location",
            fields: ["id"],
            variables: { take: 1 },
        })

        if (!locations || locations.length === 0) {
            console.warn("No stock location found, skipping fulfillment creation")
            return
        }

        // Get a fulfillment provider (required)
        const providers = await remoteQuery({
            entryPoint: "fulfillment_provider",
            fields: ["id"],
            variables: { take: 1 },
        })

        if (!providers || providers.length === 0) {
            console.warn("No fulfillment provider found, skipping fulfillment creation")
            return
        }

        // Create fulfillment
        await fulfillmentService.createFulfillment({
            location_id: locations[0].id,
            provider_id: providers[0].id,
            shipped_at: new Date(),
        })
    } else {
        // Update existing fulfillment
        await fulfillmentService.updateFulfillment(fulfillments[0].id, {
            shipped_at: new Date(),
        })
    }
}

// Helper: Handle delivered status
async function handleDeliveredStatus(orderId: string, orderItems: any[], fulfillmentService: any, remoteQuery: any) {
    const fulfillments = await getFulfillments(orderId, remoteQuery)

    if (fulfillments.length === 0) {
        // Get a stock location (required for fulfillment)
        const locations = await remoteQuery({
            entryPoint: "stock_location",
            fields: ["id"],
            variables: { take: 1 },
        })

        if (!locations || locations.length === 0) {
            console.warn("No stock location found, skipping fulfillment creation")
            return
        }

        // Get a fulfillment provider (required)
        const providers = await remoteQuery({
            entryPoint: "fulfillment_provider",
            fields: ["id"],
            variables: { take: 1 },
        })

        if (!providers || providers.length === 0) {
            console.warn("No fulfillment provider found, skipping fulfillment creation")
            return
        }

        // Create fulfillment marked as delivered
        await fulfillmentService.createFulfillment({
            location_id: locations[0].id,
            provider_id: providers[0].id,
            shipped_at: new Date(),
            delivered_at: new Date(),
        })
    } else {
        // Update existing fulfillment as delivered
        await fulfillmentService.updateFulfillment(fulfillments[0].id, {
            shipped_at: fulfillments[0].shipped_at || new Date(),
            delivered_at: new Date(),
        })
    }
}

// Helper: Cancel fulfillments
async function cancelFulfillments(orderId: string, fulfillmentService: any, remoteQuery: any) {
    const fulfillments = await getFulfillments(orderId, remoteQuery)

    for (const fulfillment of fulfillments) {
        if (!fulfillment.canceled_at) {
            await fulfillmentService.updateFulfillment(fulfillment.id, {
                canceled_at: new Date(),
            })
        }
    }
}

// Helper: Get fulfillments for order
async function getFulfillments(orderId: string, remoteQuery: any) {
    try {
        const result = await remoteQuery({
            entryPoint: "order_fulfillment",
            fields: ["fulfillment_id"],
            variables: { filters: { order_id: orderId } },
        })

        if (!result || result.length === 0) return []

        const fulfillmentIds = result.map((r: any) => r.fulfillment_id)

        const fulfillments = await remoteQuery({
            entryPoint: "fulfillment",
            fields: ["id", "shipped_at", "delivered_at", "canceled_at"],
            variables: { filters: { id: fulfillmentIds } },
        })

        return fulfillments || []
    } catch {
        return []
    }
}
