import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import AppHeroModuleService from "../../../modules/app_hero/service"
import { APP_HERO_MODULE } from "../../../modules/app_hero"

/**
 * GET /store/app-hero-slides
 *
 * Supports cache-validation via `?version=<iso-timestamp>`:
 *   - Client sends the `updated_at` of its cached data.
 *   - If no slide has changed since that timestamp, returns { changed: false } — tiny payload.
 *   - Otherwise returns { version, slides[] } — full data for the client to cache.
 *
 * `version` in the response is the ISO string of the most recently updated slide.
 * On first load, client sends no version → always gets full data.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const service: AppHeroModuleService = req.scope.resolve(APP_HERO_MODULE)

    try {
        const slides = await service.listAppHeroSlides(
            { is_active: true },
            { order: { sort_order: "ASC" } }
        )

        // Compute version = latest updated_at across all active slides
        const version = slides.reduce<string | null>((latest, s: any) => {
            const ts: string | undefined = s.updated_at
            if (!ts) return latest
            if (!latest) return ts
            return ts > latest ? ts : latest
        }, null) ?? new Date(0).toISOString()

        const clientVersion = req.query.version as string | undefined

        if (clientVersion && clientVersion === version) {
            // Client already has the latest — save bandwidth
            return res.json({ changed: false })
        }

        res.json({ version, slides })
    } catch (error: any) {
        res.status(500).json({
            message: "Error fetching app hero slides",
            error: error.message,
        })
    }
}
