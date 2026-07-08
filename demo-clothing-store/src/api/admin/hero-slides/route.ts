import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import HeroModuleService from "../../../modules/hero/service"
import { HERO_MODULE } from "../../../modules/hero"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const heroService: HeroModuleService = req.scope.resolve(HERO_MODULE)

    try {
        const slides = await heroService.listHeroSlides({}, {
            order: { sort_order: "ASC" },
        })

        res.json({ slides })
    } catch (error: any) {
        res.status(500).json({
            message: "Error fetching hero slides",
            error: error.message,
        })
    }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const heroService: HeroModuleService = req.scope.resolve(HERO_MODULE)

    try {
        type SlideType = "side_image_left" | "side_image_right" | "center_text" | "video" | "static_image"

        const body = req.body as {
            is_web?: boolean
            is_app?: boolean
            slide_type?: SlideType
            title?: string
            description?: string
            button_text?: string
            button_link?: string
            background_image?: string
            side_image?: string
            video_url?: string
            overlay_color?: string
            sort_order?: number
            is_active?: boolean

            // App fields
            subtitle?: string
            image?: string
            link_type?: string
            link_value?: string
            link_label?: string
        }

        const slide = await heroService.createHeroSlides({
            is_web: body.is_web ?? true,
            is_app: body.is_app ?? false,
            slide_type: (body.slide_type as SlideType) || null,
            title: body.title || null,
            description: body.description || null,
            button_text: body.button_text || null,
            button_link: body.button_link || null,
            background_image: body.background_image || null,
            side_image: body.side_image || null,
            video_url: body.video_url || null,
            overlay_color: body.overlay_color || null,
            sort_order: body.sort_order ?? 0,
            is_active: body.is_active ?? true,

            // Mobile app specific
            subtitle: body.subtitle || null,
            image: body.image || null,
            link_type: (body.link_type as any) || "none",
            link_value: body.link_value || null,
            link_label: body.link_label || null,
        })

        res.json({ slide })
    } catch (error: any) {
        res.status(500).json({
            message: "Error creating hero slide",
            error: error.message,
        })
    }
}
