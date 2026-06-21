import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import BulkModuleService from "../../../modules/bulk/service"
import { BULK_MODULE } from "../../../modules/bulk"

/**
 * GET /admin/bulk-products
 * Returns all bulk products (including inactive ones)
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const bulkService: BulkModuleService = req.scope.resolve(BULK_MODULE)

    try {
        const bulkProducts = await bulkService.listBulkProducts(
            {},
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

/**
 * POST /admin/bulk-products
 * Add a product to the bulk list
 * Body: { product_id, min_quantity?, notes?, is_active? }
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const bulkService: BulkModuleService = req.scope.resolve(BULK_MODULE)

    try {
        const body = req.body as {
            product_id: string
            min_quantity?: number | null
            notes?: string | null
            is_active?: boolean
        }

        if (!body.product_id) {
            return res.status(400).json({ message: "product_id is required" })
        }

        // Check if already exists (non-deleted)
        const existing = await bulkService.listBulkProducts({ product_id: body.product_id })
        if (existing.length > 0) {
            return res.status(409).json({ message: "Product is already in the bulk list" })
        }

        const bulkProduct = await bulkService.createBulkProducts({
            product_id: body.product_id,
            is_active: body.is_active ?? true,
            min_quantity: body.min_quantity ?? null,
            notes: body.notes ?? null,
        })

        res.json({ bulk_product: bulkProduct })
    } catch (error: any) {
        res.status(500).json({
            message: "Error adding bulk product",
            error: error.message,
        })
    }
}
