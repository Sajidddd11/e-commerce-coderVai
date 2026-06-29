import { ExecArgs } from "@medusajs/framework/types"
import type HeroModuleService from "../modules/hero/service"
import { HERO_MODULE } from "../modules/hero"

export default async function listHeroSlides({ container }: ExecArgs) {
    const logger = container.resolve("logger")
    const heroService = container.resolve(HERO_MODULE) as HeroModuleService

    logger.info("Fetching hero slides...")

    try {
        const slides = await heroService.listHeroSlides({}, {
            order: { sort_order: "ASC" },
        })
        logger.info(`Found ${slides.length} slides in total:`)
        logger.info(JSON.stringify(slides, null, 2))
    } catch (error: any) {
        logger.error(`Error fetching slides: ${error.message}`)
        throw error
    }
}
