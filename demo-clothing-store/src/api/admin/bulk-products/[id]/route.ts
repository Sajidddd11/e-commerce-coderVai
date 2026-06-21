import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import BulkModuleService from "../../../../modules/bulk/service"
import { BULK_MODULE } from "../../../../modules/bulk"

/**
 * POST /admin/bulk-products/:id
 * Update a bulk product (toggle is_active, update min_quantity, notes)
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const bulkService: BulkModuleService = req.scope.resolve(BULK_MODULE)
    const { id } = req.params

    try {
        const body = req.body as {
            is_active?: boolean
            min_quantity?: number | null
            notes?: string | null
        }

        const updated = await bulkService.updateBulkProducts({
            id,
            ...body,
        })

        res.json({ bulk_product: updated })
    } catch (error: any) {
        res.status(500).json({
            message: "Error updating bulk product",
            error: error.message,
        })
    }
}

/**
 * DELETE /admin/bulk-products/:id
 * Remove a product from the bulk list (soft delete)
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const bulkService: BulkModuleService = req.scope.resolve(BULK_MODULE)
    const { id } = req.params

    try {
        await bulkService.deleteBulkProducts(id)
        res.json({ success: true, id })
    } catch (error: any) {
        res.status(500).json({
            message: "Error deleting bulk product",
            error: error.message,
        })
    }
}
