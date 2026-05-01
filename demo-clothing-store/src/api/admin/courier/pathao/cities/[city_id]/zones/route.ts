import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PathaoService } from "~/lib/pathao-service"

/**
 * GET /admin/courier/pathao/cities/:city_id/zones
 * Get list of zones for a city from Pathao
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const { city_id } = req.params

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
        const zones = await pathaoService.getZones(parseInt(city_id))

        return res.json({ zones })
    } catch (error: any) {
        console.error('Error fetching zones:', error)
        return res.status(500).json({
            message: error?.response?.data?.message || error?.message || 'Failed to fetch zones'
        })
    }
}
