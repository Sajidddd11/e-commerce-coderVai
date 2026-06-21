import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/courier/active
 * Returns the currently active courier provider name
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    try {
        const active = await pgConnection('courier_config')
            .where('is_active', true)
            .first()

        return res.json({
            provider: active?.provider ?? null,
            config: active ?? null,
        })
    } catch (error: any) {
        console.error('Error fetching active courier:', error)
        return res.status(500).json({
            message: error?.message ?? 'Failed to fetch active courier'
        })
    }
}

/**
 * POST /admin/courier/active
 * Body: { provider: string }
 * Sets the given provider as active and deactivates all others.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const { provider } = req.body as { provider: string }

    if (!provider) {
        return res.status(400).json({ message: 'provider is required' })
    }

    try {
        const now = new Date()

        // Make sure the provider exists before we flip switches
        const exists = await pgConnection('courier_config')
            .where('provider', provider)
            .first()

        if (!exists) {
            return res.status(404).json({
                message: `Provider '${provider}' has not been configured yet`
            })
        }

        // Deactivate all providers
        await pgConnection('courier_config').update({ is_active: false, updated_at: now })

        // Activate the requested one
        await pgConnection('courier_config')
            .where('provider', provider)
            .update({ is_active: true, updated_at: now })

        return res.json({
            message: `'${provider}' is now the active courier`,
            provider,
        })
    } catch (error: any) {
        console.error('Error switching active courier:', error)
        return res.status(500).json({
            message: error?.message ?? 'Failed to switch active courier'
        })
    }
}
