import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import HeroModuleService from "../../../modules/hero/service"
import { HERO_MODULE } from "../../../modules/hero"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const heroService: HeroModuleService = req.scope.resolve(HERO_MODULE)

    try {
        const slides = await heroService.listHeroSlides(
            { is_active: true, is_web: true },
            {
                order: { sort_order: "ASC" },
            }
        )

        res.json({ slides })
    } catch (error: any) {
        res.status(500).json({
            message: "Error fetching hero slides",
            error: error.message,
        })
    }
}
