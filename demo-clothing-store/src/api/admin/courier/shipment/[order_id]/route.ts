import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/courier/shipment/:order_id
 * Get shipment details for an order
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const { order_id } = req.params

    console.log('🔎 GET shipment request - Order ID from params:', order_id)
    console.log('🔎 Full params:', req.params)
    console.log('🔎 Full URL:', req.url)

    try {
        const shipments = await pgConnection('courier_shipment')
            .where('order_id', order_id)
            .orderBy('created_at', 'desc')

        console.log('🔎 Found shipments:', shipments.length)

        const safeJsonParse = (value: any) => {
            if (typeof value !== 'string') return value
            try { return JSON.parse(value) } catch { return value }
        }

        // Parse JSON fields
        const parsedShipments = shipments.map(shipment => ({
            ...shipment,
            tracking_data: safeJsonParse(shipment.tracking_data),
            request_payload: safeJsonParse(shipment.request_payload),
            response_payload: safeJsonParse(shipment.response_payload),
        }))

        return res.json({ shipments: parsedShipments })
    } catch (error: any) {
        console.error('Error fetching shipments:', error)
        return res.status(500).json({
            message: error?.message ?? 'Failed to fetch shipments'
        })
    }
}
