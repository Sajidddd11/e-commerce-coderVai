import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PathaoService } from "~/lib/pathao-service"

/**
 * GET /admin/courier/shipment/:shipment_id/track
 * Track shipment status from courier API
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const { shipment_id } = req.params

    try {
        // Get shipment record
        const shipment = await pgConnection('courier_shipment')
            .where('id', shipment_id)
            .first()

        if (!shipment) {
            return res.status(404).json({
                message: 'Shipment not found'
            })
        }

        if (!shipment.consignment_id) {
            return res.status(400).json({
                message: 'Shipment has no consignment ID to track'
            })
        }

        // Get courier config
        const courierConfig = await pgConnection('courier_config')
            .where('provider', shipment.provider)
            .first()

        if (!courierConfig) {
            return res.status(404).json({
                message: `No configuration found for provider '${shipment.provider}'`
            })
        }

        const config = typeof courierConfig.config === 'string'
            ? JSON.parse(courierConfig.config)
            : courierConfig.config

        if (shipment.provider === 'pathao') {
            const pathaoService = new PathaoService(config, pgConnection)
            const trackingInfo = await pathaoService.getOrderInfo(shipment.consignment_id)

            // Update shipment record with latest tracking data
            await pgConnection('courier_shipment')
                .where('id', shipment_id)
                .update({
                    tracking_data: JSON.stringify(trackingInfo),
                    status: trackingInfo.order_status_slug?.toLowerCase() || shipment.status,
                    updated_at: new Date()
                })

            // Get the updated shipment record
            const updatedShipment = await pgConnection('courier_shipment')
                .where('id', shipment_id)
                .first()

            return res.json({
                success: true,
                tracking: trackingInfo,
                shipment: {
                    id: updatedShipment.id,
                    provider: updatedShipment.provider,
                    status: updatedShipment.status,
                    consignment_id: updatedShipment.consignment_id,
                    order_id: updatedShipment.order_id,
                    tracking_data: typeof updatedShipment.tracking_data === 'string'
                        ? JSON.parse(updatedShipment.tracking_data)
                        : updatedShipment.tracking_data
                }
            })
        } else {
            return res.status(400).json({
                message: `Provider '${shipment.provider}' is not supported yet`
            })
        }
    } catch (error: any) {
        console.error('Error tracking shipment:', error)
        return res.status(500).json({
            success: false,
            message: error?.response?.data?.message || error?.message || 'Failed to track shipment',
            error: error?.response?.data || error?.message
        })
    }
}
