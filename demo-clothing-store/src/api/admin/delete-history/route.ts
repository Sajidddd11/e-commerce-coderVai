import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DELETE_LOG_MODULE } from "../../../modules/delete-log"

// GET /admin/delete-history
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const deleteLogService = req.scope.resolve(DELETE_LOG_MODULE) as any

    const limit = parseInt((req.query.limit as string) ?? "50")
    const offset = parseInt((req.query.offset as string) ?? "0")
    const entity_type = req.query.entity_type as string | undefined
    const action = req.query.action as string | undefined

    const filters: Record<string, any> = {}
    if (entity_type) filters.entity_type = entity_type
    if (action) filters.action = action

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
