import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const smsLogService = req.scope.resolve("smsLogModuleService") as any
    
    const { limit = 50, offset = 0, status, order_id } = req.query

    const filters: any = {}
    if (status) {
      filters.status = status
    }
    if (order_id) {
      filters.order_id = order_id
    }

    const [logs, count] = await smsLogService.listAndCountSmsLogs(filters, {
      take: Number(limit),
      skip: Number(offset),
      order: { created_at: "DESC" },
    })

    return res.status(200).json({
      logs,
      count,
      limit: Number(limit),
      offset: Number(offset),
    })
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message ?? "Failed to fetch SMS logs",
    })
  }
}

