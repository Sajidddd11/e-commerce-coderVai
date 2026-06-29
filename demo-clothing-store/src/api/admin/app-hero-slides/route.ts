import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import AppHeroModuleService from "../../../modules/app_hero/service"
import { APP_HERO_MODULE } from "../../../modules/app_hero"

/** GET /admin/app-hero-slides — list all slides (all statuses, for admin) */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const service: AppHeroModuleService = req.scope.resolve(APP_HERO_MODULE)

    try {
        const slides = await service.listAppHeroSlides(
            {},
            { order: { sort_order: "ASC" } }
        )
        res.json({ slides })
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching app hero slides", error: error.message })
    }
}

type LinkType = "none" | "shop" | "new_arrivals" | "best_selling" | "recommended" | "category" | "collection" | "product" | "search"

interface CreateBody {
    title?: string
    subtitle?: string
    image: string
    link_type?: LinkType
    link_value?: string
    link_label?: string
    sort_order?: number
    is_active?: boolean
}

/** POST /admin/app-hero-slides — create a new slide */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const service: AppHeroModuleService = req.scope.resolve(APP_HERO_MODULE)

    try {
        const body = req.body as CreateBody

        if (!body.image) {
            return res.status(400).json({ message: "image is required" })
        }

        const slide = await service.createAppHeroSlides({
            title: body.title ?? null,
            subtitle: body.subtitle ?? null,
            image: body.image,
            link_type: (body.link_type ?? "none") as LinkType,
            link_value: body.link_value ?? null,
            link_label: body.link_label ?? null,
            sort_order: body.sort_order ?? 0,
            is_active: body.is_active ?? true,
        })

        res.json({ slide })
    } catch (error: any) {
        res.status(500).json({ message: "Error creating app hero slide", error: error.message })
    }
}
