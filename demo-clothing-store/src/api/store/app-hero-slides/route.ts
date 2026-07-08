import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import HeroModuleService from "../../../modules/hero/service"
import { HERO_MODULE } from "../../../modules/hero"

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
    const heroService: HeroModuleService = req.scope.resolve(HERO_MODULE)

    try {
        const slides = await heroService.listHeroSlides(
            { is_active: true, is_app: true },
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

        // Map fields to match mobile app expectations perfectly
        const formattedSlides = slides.map((s: any) => ({
            id: s.id,
            title: s.title,
            subtitle: s.subtitle,
            image: s.image,
            link_type: s.link_type,
            link_value: s.link_value,
            link_label: s.link_label,
            sort_order: s.sort_order,
            is_active: s.is_active,
            created_at: s.created_at,
            updated_at: s.updated_at,
        }))

        res.json({ version, slides: formattedSlides })
    } catch (error: any) {
        res.status(500).json({
            message: "Error fetching app hero slides",
            error: error.message,
        })
    }
}
