import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const smsLogService = req.scope.resolve("smsLogModuleService") as any

    // Get stats for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [allLogs] = await smsLogService.listAndCountSmsLogs(
      {
        created_at: {
          $gte: thirtyDaysAgo,
        },
      },
      { take: 10000 }
    )

    const stats = {
      total: allLogs.length,
      sent: allLogs.filter((log: any) => log.status === "sent").length,
      failed: allLogs.filter((log: any) => log.status === "failed").length,
      pending: allLogs.filter((log: any) => log.status === "pending").length,
      delivered: allLogs.filter((log: any) => log.status === "delivered").length,
    }

    // Get recent failures
    const [recentFailures] = await smsLogService.listAndCountSmsLogs(
      { status: "failed" },
      {
        take: 10,
        order: { created_at: "DESC" },
      }
    )

    return res.status(200).json({
      stats,
      recent_failures: recentFailures,
    })
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message ?? "Failed to fetch SMS stats",
    })
  }
}

