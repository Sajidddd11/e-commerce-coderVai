import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import BulkModuleService from "../../../modules/bulk/service"
import { BULK_MODULE } from "../../../modules/bulk"

/**
 * GET /store/bulk-products
 * Public endpoint — returns only active bulk product IDs so the storefront
 * can fetch full product details from the standard Medusa products API.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const bulkService: BulkModuleService = req.scope.resolve(BULK_MODULE)

    try {
        const bulkProducts = await bulkService.listBulkProducts(
            { is_active: true },
            { order: { created_at: "DESC" } }
        )

        res.json({ bulk_products: bulkProducts })
    } catch (error: any) {
        res.status(500).json({
            message: "Error fetching bulk products",
            error: error.message,
        })
    }
}
