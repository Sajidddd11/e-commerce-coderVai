import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PathaoService } from "~/lib/pathao-service"

/**
 * GET /admin/courier/pathao/stores
 * Get Pathao stores (from API and local database)
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    try {
        // Get local stores
        const localStores = await pgConnection('pathao_store')
            .select('*')
            .orderBy('is_default', 'desc')
            .orderBy('store_name', 'asc')

        // Try to fetch from Pathao API
        let apiStores: any[] = []
        try {
            const courierConfig = await pgConnection('courier_config')
                .where('provider', 'pathao')
                .where('is_active', true)
                .first()

            if (courierConfig) {
                const config = typeof courierConfig.config === 'string'
                    ? JSON.parse(courierConfig.config)
                    : courierConfig.config

                const pathaoService = new PathaoService(config, pgConnection)
                apiStores = await pathaoService.getStores()
            }
        } catch (apiError) {
            console.error('Error fetching stores from Pathao API:', apiError)
        }

        return res.json({
            local_stores: localStores,
            api_stores: apiStores
        })
    } catch (error: any) {
        console.error('Error fetching Pathao stores:', error)
        return res.status(500).json({
            message: error?.message ?? 'Failed to fetch Pathao stores'
        })
    }
}

/**
 * POST /admin/courier/pathao/stores
 * Save Pathao store to local database
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const {
        store_id,
        store_name,
        contact_name,
        contact_number,
        address,
        city_id,
        zone_id,
        area_id,
        is_default
    } = req.body as {
        store_id: number
        store_name: string
        contact_name?: string
        contact_number?: string
        address?: string
        city_id?: number
        zone_id?: number
        area_id?: number
        is_default?: boolean
    }

    if (!store_id || !store_name) {
        return res.status(400).json({
            message: 'store_id and store_name are required'
        })
    }

    try {
        const now = new Date()
        const id = `pathao_store_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`.toUpperCase()

        // If this is set as default, unset other defaults
        if (is_default) {
            await pgConnection('pathao_store')
                .update({ is_default: false })
        }

        // Check if store already exists
        const existing = await pgConnection('pathao_store')
            .where('store_id', store_id)
            .first()

        if (existing) {
            // Update existing
            await pgConnection('pathao_store')
                .where('store_id', store_id)
                .update({
                    store_name,
                    contact_name,
                    contact_number,
                    address,
                    city_id,
                    zone_id,
                    area_id,
                    is_default: is_default || false,
                    updated_at: now
                })

            const updated = await pgConnection('pathao_store')
                .where('store_id', store_id)
                .first()

            return res.json({
                message: 'Pathao store updated successfully',
                store: updated
            })
        } else {
            // Create new
            await pgConnection('pathao_store').insert({
                id,
                store_id,
                store_name,
                contact_name,
                contact_number,
                address,
                city_id,
                zone_id,
                area_id,
                is_default: is_default || false,
                is_active: true,
                created_at: now,
                updated_at: now
            })

            const created = await pgConnection('pathao_store')
                .where('id', id)
                .first()

            return res.json({
                message: 'Pathao store saved successfully',
                store: created
            })
        }
    } catch (error: any) {
        console.error('Error saving Pathao store:', error)
        return res.status(500).json({
            message: error?.message ?? 'Failed to save Pathao store'
        })
    }
}
