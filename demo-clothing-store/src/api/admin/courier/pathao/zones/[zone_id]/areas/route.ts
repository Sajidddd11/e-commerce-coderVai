import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PathaoService } from "~/lib/pathao-service"

/**
 * GET /admin/courier/pathao/zones/:zone_id/areas
 * Get list of areas for a zone from Pathao
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const { zone_id } = req.params

    try {
        const courierConfig = await pgConnection('courier_config')
            .where('provider', 'pathao')
            .where('is_active', true)
            .first()

        if (!courierConfig) {
            return res.status(404).json({
                message: 'No active Pathao configuration found'
            })
        }

        const config = typeof courierConfig.config === 'string'
            ? JSON.parse(courierConfig.config)
            : courierConfig.config

        const pathaoService = new PathaoService(config, pgConnection)
        const areas = await pathaoService.getAreas(parseInt(zone_id))

        return res.json({ areas })
    } catch (error: any) {
        console.error('Error fetching areas:', error)
        return res.status(500).json({
            message: error?.response?.data?.message || error?.message || 'Failed to fetch areas'
        })
    }
}
