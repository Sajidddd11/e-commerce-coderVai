import { MedusaContainer } from "@medusajs/framework/types"
import { RECOMMENDATION_MODULE } from "../modules/recommendation"
import type RecommendationModuleService from "../modules/recommendation/service"

/**
 * Nightly cleanup job — runs at 3:00 AM every day.
 *
 * Soft-deletes anonymous (guest) behaviour events older than 90 days.
 * Customer (logged-in) events are kept indefinitely for personalisation.
 *
 * This keeps the behaviour_event table bounded in size on the VPS.
 */
export default async function cleanupBehaviourEventsJob(container: MedusaContainer) {
    const recommendationService: RecommendationModuleService =
        container.resolve(RECOMMENDATION_MODULE)

    console.log("[Cleanup Job] 🗑️  Cleaning up old guest behaviour events...")

    try {
        const deleted = await recommendationService.cleanupOldGuestEvents(90)
        console.log(`[Cleanup Job] ✅ Soft-deleted ${deleted} old guest events`)
    } catch (error: any) {
        console.error("[Cleanup Job] ❌ Error:", error?.message)
        throw error
    }
}

export const config = {
    name:     "cleanup-behaviour-events",
    schedule: "0 3 * * *", // 3:00 AM every day
}
