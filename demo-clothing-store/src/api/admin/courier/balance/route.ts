import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PathaoService } from "~/lib/pathao-service"
import { SteadfastService } from "~/lib/steadfast-service"

/**
 * GET /admin/courier/balance
 * Retrieve balance / status for all configured couriers
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    const balances = {
        pathao: { success: false, balance: null as string | null, message: 'Not configured' },
        steadfast: { success: false, balance: null as string | null, message: 'Not configured' }
    }

    try {
        const configs = await pgConnection('courier_config').select('*')

        // Process Pathao
        const pathaoCfg = configs.find(c => c.provider === 'pathao')
        if (pathaoCfg) {
            try {
                const config = typeof pathaoCfg.config === 'string'
                    ? JSON.parse(pathaoCfg.config)
                    : pathaoCfg.config

                const pathaoService = new PathaoService(config, pgConnection)
                const token = await pathaoService.getAccessToken()
                if (token) {
                    balances.pathao = {
                        success: true,
                        balance: 'N/A (COD Model)',
                        message: 'Connected successfully'
                    }
                }
            } catch (err: any) {
                console.error('Error verifying Pathao connection:', err)
                balances.pathao = {
                    success: false,
                    balance: null,
                    message: err.message || 'Failed to authenticate with Pathao'
                }
            }
        }

        // Process Steadfast
        const steadfastCfg = configs.find(c => c.provider === 'steadfast')
        if (steadfastCfg) {
            try {
                const config = typeof steadfastCfg.config === 'string'
                    ? JSON.parse(steadfastCfg.config)
                    : steadfastCfg.config

                const steadfastService = new SteadfastService(config)
                const result = await steadfastService.getBalance()
                if (result.status === 200) {
                    balances.steadfast = {
                        success: true,
                        balance: `৳${result.current_balance}`,
                        message: 'Balance retrieved successfully'
                    }
                } else {
                    balances.steadfast = {
                        success: false,
                        balance: null,
                        message: `Failed to retrieve balance (Status ${result.status})`
                    }
                }
            } catch (err: any) {
                console.error('Error fetching Steadfast balance:', err)
                balances.steadfast = {
                    success: false,
                    balance: null,
                    message: err.message || 'Failed to retrieve Steadfast balance'
                }
            }
        }

        return res.json({
            success: true,
            balances
        })
    } catch (error: any) {
        console.error('Error fetching courier balances:', error)
        return res.status(500).json({
            success: false,
            message: error?.message ?? 'Failed to check courier balances'
        })
    }
}
