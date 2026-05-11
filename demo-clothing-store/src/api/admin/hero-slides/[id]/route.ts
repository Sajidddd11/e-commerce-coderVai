import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import HeroModuleService from "../../../../modules/hero/service"
import { HERO_MODULE } from "../../../../modules/hero"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const heroService: HeroModuleService = req.scope.resolve(HERO_MODULE)
    const { id } = req.params

    try {
        const slide = await heroService.retrieveHeroSlide(id)

        if (!slide) {
            return res.status(404).json({ message: "Hero slide not found" })
        }

        res.json({ slide })
    } catch (error: any) {
        res.status(500).json({
            message: "Error fetching hero slide",
            error: error.message,
        })
    }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const heroService: HeroModuleService = req.scope.resolve(HERO_MODULE)
    const { id } = req.params

    try {
        const body = req.body as Record<string, any>
        const slide = await heroService.updateHeroSlides({ ...body, id })

        res.json({ slide })
    } catch (error: any) {
        res.status(500).json({
            message: "Error updating hero slide",
            error: error.message,
        })
    }
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const heroService: HeroModuleService = req.scope.resolve(HERO_MODULE)
    const { id } = req.params

    try {
        await heroService.deleteHeroSlides(id)

        res.json({ id, deleted: true })
    } catch (error: any) {
        res.status(500).json({
            message: "Error deleting hero slide",
            error: error.message,
        })
    }
}
