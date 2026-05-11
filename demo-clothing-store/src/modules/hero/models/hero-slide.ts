import { model } from "@medusajs/framework/utils"

const HeroSlide = model.define("hero_slide", {
    id: model.id().primaryKey(),
    slide_type: model.enum(["side_image_left", "side_image_right", "center_text", "video", "static_image"]),
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
})

export default HeroSlide
