import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { RECOMMENDATION_MODULE } from "../../../../modules/recommendation"
import type RecommendationModuleService from "../../../../modules/recommendation/service"
import { upstashRedis } from "../../../../lib/redis/upstash"

/**
 * POST /store/recommendations/merge
 *
 * Called immediately after a user logs in on any device (storefront or mobile).
 * Links all guest behaviour events (tracked by session_id and/or fingerprint_id)
 * to the authenticated customer_id — so browsing history is preserved across devices.
 *
 * Also invalidates the personalised recommendation cache for the customer
 * so the next request gets fresh merged data.
 *
 * Body:
 *   customer_id     string  (required)
 *   session_id      string  (required)
 *   fingerprint_id? string
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const { customer_id, session_id, fingerprint_id } = req.body as Record<string, string>

        if (!customer_id || !session_id) {
            return res.status(400).json({ message: "customer_id and session_id are required" })
        }

        const recommendationService: RecommendationModuleService =
            req.scope.resolve(RECOMMENDATION_MODULE)

        // Run merge — links all guest events under this session/fingerprint to the customer
        await recommendationService.mergeGuestToCustomer({
            customer_id,
            session_id,
            fingerprint_id: fingerprint_id || undefined,
        })

        // Bust the cached personalised recommendations so the next fetch reflects merged data
        await Promise.allSettled([
            upstashRedis.del(`recommendations:personalised:${customer_id}:10`),
            upstashRedis.del(`recommendations:personalised:${customer_id}:20`),
            upstashRedis.del(`recommendations:personalised:${customer_id}:40`),
            upstashRedis.del(`recommendations:personalised:${customer_id}:6`),
        ])

        return res.status(200).json({ ok: true, merged: true })
    } catch (error: any) {
        console.error("[Recommendations/Merge] ❌ Error:", error)
        return res.status(500).json({ message: error?.message ?? "Merge failed" })
    }
}
