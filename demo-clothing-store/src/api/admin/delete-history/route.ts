import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DELETE_LOG_MODULE } from "../../../modules/delete-log"

// GET /admin/delete-history
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const deleteLogService = req.scope.resolve(DELETE_LOG_MODULE) as any

    const limit = parseInt((req.query.limit as string) ?? "50")
    const offset = parseInt((req.query.offset as string) ?? "0")
    const entity_type = req.query.entity_type as string | undefined
    const action = req.query.action as string | undefined
    const start_date = req.query.start_date as string | undefined
    const end_date = req.query.end_date as string | undefined

    const filters: Record<string, any> = {}
    if (entity_type) filters.entity_type = entity_type
    if (action) filters.action = action

    if (start_date || end_date) {
        const created_at_filter: Record<string, any> = {}
        if (start_date) {
            const startDate = new Date(start_date)
            if (!isNaN(startDate.getTime())) {
                created_at_filter.$gte = startDate
            }
        }
        if (end_date) {
            const endDate = new Date(end_date)
            if (!isNaN(endDate.getTime())) {
                endDate.setHours(23, 59, 59, 999)
                created_at_filter.$lte = endDate
            }
        }
        if (Object.keys(created_at_filter).length > 0) {
            filters.created_at = created_at_filter
        }
    }

    const [logs, count] = await deleteLogService.listAndCountDeleteLogs(filters, {
        take: limit,
        skip: offset,
        order: { created_at: "DESC" },
    })

    return res.json({
        logs,
        count,
        limit,
        offset,
    })
}
