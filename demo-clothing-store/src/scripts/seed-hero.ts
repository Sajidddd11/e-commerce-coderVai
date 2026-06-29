import { ExecArgs } from "@medusajs/framework/types"
import type HeroModuleService from "../modules/hero/service"
import { HERO_MODULE } from "../modules/hero"

const sampleSlides = [
    {
        slide_type: "side_image_left",
        title: "Premium Audio Gear",
        description: "Experience the best quality sound with our curated collection of headphones.",
        button_text: "Shop Headphones",
        button_link: "/categories/headphones",
        background_image: "",
        side_image: "/banners/headphone.jpg",
        overlay_color: "linear-gradient(135deg, #1e293b, #0f172a)",
        sort_order: 1,
        is_active: true
    },
    {
        slide_type: "side_image_right",
        title: "Step in Style",
        description: "Explore the newest sneakers designed for comfort and durability.",
        button_text: "Shop Sneakers",
        button_link: "/categories/sneakers",
        background_image: "",
        side_image: "/banners/snicker.jpg",
        overlay_color: "linear-gradient(135deg, #111827, #374151)",
        sort_order: 2,
        is_active: true
    },
    {
        slide_type: "center_text",
        title: "Time is Golden",
        description: "Discover our premium watches that redefine luxury and style.",
        button_text: "Shop Watches",
        button_link: "/categories/watches",
        background_image: "/banners/watch.jpg",
        overlay_color: "rgba(0, 0, 0, 0.4)",
        sort_order: 3,
        is_active: true
    },
    {
        slide_type: "static_image",
        title: "Discover All Collections",
        description: "Find the perfect outfit from our latest season arrivals.",
        button_text: "Browse Store",
        button_link: "/store",
        background_image: "/banners/all.png",
        overlay_color: "rgba(0, 0, 0, 0.35)",
        sort_order: 4,
        is_active: true
    }
]

export default async function seedHeroSlides({ container }: ExecArgs) {
    const logger = container.resolve("logger")
    const heroService = container.resolve(HERO_MODULE) as HeroModuleService

    logger.info("Starting hero slides seeding...")

    try {
        for (const slideData of sampleSlides) {
            logger.info(`Creating hero slide: ${slideData.title}`)
            await heroService.createHeroSlides(slideData as any)
        }
        logger.info(`\n✅ Successfully seeded ${sampleSlides.length} hero slides!`)
    } catch (error: any) {
        logger.error(`Error seeding slides: ${error.message}`)
        throw error
    }
}
