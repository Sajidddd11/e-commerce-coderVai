import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/courier/config
 * Get all courier configurations
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    try {
        const configs = await pgConnection('courier_config')
            .select('*')
            .orderBy('provider', 'asc')

        // Parse JSON config fields
        const parsedConfigs = configs.map(config => ({
            ...config,
            config: typeof config.config === 'string' ? JSON.parse(config.config) : config.config
        }))

        return res.json({ configs: parsedConfigs })
    } catch (error: any) {
        console.error('Error fetching courier configs:', error)
        return res.status(500).json({
            message: error?.message ?? 'Failed to fetch courier configurations'
        })
    }
}

/**
 * POST /admin/courier/config
 * Create or update courier configuration
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const { provider, is_active, is_sandbox, config } = req.body as {
        provider: string
        is_active: boolean
        is_sandbox: boolean
        config: any
    }

    if (!provider || !config) {
        return res.status(400).json({
            message: 'Provider and config are required'
        })
    }

    try {
        const now = new Date()
        const id = `courier_${provider}_${Date.now()}`

        // Check if config already exists for this provider
        const existing = await pgConnection('courier_config')
            .where('provider', provider)
            .first()

        if (existing) {
            // Update existing config
            await pgConnection('courier_config')
                .where('provider', provider)
                .update({
                    is_active,
                    is_sandbox,
                    config: JSON.stringify(config),
                    updated_at: now
                })

            const updated = await pgConnection('courier_config')
                .where('provider', provider)
                .first()

            return res.json({
                message: 'Courier configuration updated successfully',
                config: {
                    ...updated,
                    config: typeof updated.config === 'string' ? JSON.parse(updated.config) : updated.config
                }
            })
        } else {
            // Create new config
            await pgConnection('courier_config').insert({
                id,
                provider,
                is_active,
                is_sandbox,
                config: JSON.stringify(config),
                created_at: now,
                updated_at: now
            })

            const created = await pgConnection('courier_config')
                .where('id', id)
                .first()

            return res.json({
                message: 'Courier configuration created successfully',
                config: {
                    ...created,
                    config: typeof created.config === 'string' ? JSON.parse(created.config) : created.config
                }
            })
        }
    } catch (error: any) {
        console.error('Error saving courier config:', error)
        return res.status(500).json({
            message: error?.message ?? 'Failed to save courier configuration'
        })
    }
}

/**
 * DELETE /admin/courier/config/:provider
 * Delete courier configuration
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const { provider } = req.params

    try {
        await pgConnection('courier_config')
            .where('provider', provider)
            .delete()

        return res.json({
            message: 'Courier configuration deleted successfully'
        })
    } catch (error: any) {
        console.error('Error deleting courier config:', error)
        return res.status(500).json({
            message: error?.message ?? 'Failed to delete courier configuration'
        })
    }
}
