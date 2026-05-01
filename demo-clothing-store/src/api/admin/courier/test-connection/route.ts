import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PathaoService } from "~/lib/pathao-service"

/**
 * POST /admin/courier/test-connection
 * Test courier API connection
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const { provider, config } = req.body as {
        provider: string
        config: any
    }

    if (!provider || !config) {
        return res.status(400).json({
            message: 'Provider and config are required'
        })
    }

    try {
        if (provider === 'pathao') {
            const pathaoService = new PathaoService(config, pgConnection)

            // Try to get access token
            const token = await pathaoService.getAccessToken()

            // Try to fetch stores to verify connection
            const stores = await pathaoService.getStores()

            return res.json({
                success: true,
                message: 'Connection successful',
                data: {
                    token_obtained: !!token,
                    stores_count: stores.length,
                    stores: stores
                }
            })
        } else {
            return res.status(400).json({
                message: `Provider '${provider}' is not supported yet`
            })
        }
    } catch (error: any) {
        console.error('Error testing courier connection:', error)
        return res.status(500).json({
            success: false,
            message: error?.response?.data?.message || error?.message || 'Connection test failed',
            error: error?.response?.data || error?.message
        })
    }
}
