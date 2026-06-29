import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import AppHeroModuleService from "../../../../modules/app_hero/service"
import { APP_HERO_MODULE } from "../../../../modules/app_hero"

type LinkType = "none" | "shop" | "new_arrivals" | "best_selling" | "recommended" | "category" | "collection" | "product" | "search"

/** GET /admin/app-hero-slides/:id */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const service: AppHeroModuleService = req.scope.resolve(APP_HERO_MODULE)
    const { id } = req.params

    try {
        const slide = await service.retrieveAppHeroSlide(id)
        res.json({ slide })
    } catch (error: any) {
        res.status(404).json({ message: "App hero slide not found", error: error.message })
    }
}

/** POST /admin/app-hero-slides/:id — update (using POST to match existing web hero pattern) */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const service: AppHeroModuleService = req.scope.resolve(APP_HERO_MODULE)
    const { id } = req.params

    try {
        const body = req.body as {
            title?: string
            subtitle?: string
            image?: string
            link_type?: LinkType
            link_value?: string
            link_label?: string
            sort_order?: number
            is_active?: boolean
        }

        const slide = await service.updateAppHeroSlides({ id, ...body })
        res.json({ slide })
    } catch (error: any) {
        res.status(500).json({ message: "Error updating app hero slide", error: error.message })
    }
}

/** DELETE /admin/app-hero-slides/:id */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const service: AppHeroModuleService = req.scope.resolve(APP_HERO_MODULE)
    const { id } = req.params

    try {
        await service.deleteAppHeroSlides(id)
        res.json({ success: true })
    } catch (error: any) {
        res.status(500).json({ message: "Error deleting app hero slide", error: error.message })
    }
}
