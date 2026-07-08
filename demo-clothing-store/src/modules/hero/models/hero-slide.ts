import { model } from "@medusajs/framework/utils"

const HeroSlide = model.define("hero_slide", {
    id: model.id().primaryKey(),
    is_web: model.boolean().default(true),
    is_app: model.boolean().default(false),
    slide_type: model.enum(["side_image_left", "side_image_right", "center_text", "video", "static_image"]).nullable(),
    title: model.text().nullable(),
    description: model.text().nullable(),
    button_text: model.text().nullable(),
    button_link: model.text().nullable(),
    background_image: model.text().nullable(),
    side_image: model.text().nullable(),
    video_url: model.text().nullable(),
    overlay_color: model.text().nullable(),
    sort_order: model.number().default(0),
    is_active: model.boolean().default(true),
    
    // Mobile App specific fields
    subtitle: model.text().nullable(),
    image: model.text().nullable(),
    link_type: model.enum([
        "none",
        "shop",
        "new_arrivals",
        "best_selling",
        "recommended",
        "category",
        "collection",
        "product",
        "search",
    ]).default("none"),
    link_value: model.text().nullable(),
    link_label: model.text().nullable(),
})

export default HeroSlide
