import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PathaoService } from "~/lib/pathao-service"

/**
 * GET /admin/courier/pathao/cities
 * Get list of cities from Pathao
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

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
        const cities = await pathaoService.getCities()

        return res.json({ cities })
    } catch (error: any) {
        console.error('Error fetching cities:', error)
        return res.status(500).json({
            message: error?.response?.data?.message || error?.message || 'Failed to fetch cities'
        })
    }
}
