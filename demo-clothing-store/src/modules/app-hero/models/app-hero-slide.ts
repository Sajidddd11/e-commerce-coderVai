import { model } from "@medusajs/framework/utils"

/**
 * AppHeroSlide — hero slides specifically for the mobile app.
 *
 * link_type drives navigation inside the app:
 *   none         → no navigation (decorative)
 *   shop         → /(tabs)/shop (all products)
 *   new_arrivals → /(tabs)/shop (sorted newest)
 *   best_selling → /(tabs)/shop?sortBy=best_selling
 *   recommended  → /(tabs)/shop?sortBy=recommended
 *   category     → /(tabs)/shop?category=<link_value>  (category handle)
 *   collection   → /(tabs)/shop?collection=<link_value> (collection handle)
 *   product      → /products/<link_value>               (product handle)
 *   search       → /(tabs)/shop?q=<link_value>          (pre-filled search)
 */
const AppHeroSlide = model.define("app_hero_slide", {
    id: model.id().primaryKey(),
    title: model.text().nullable(),
    subtitle: model.text().nullable(),
    image: model.text(),
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
    /** Handle or search query — required when link_type is category/collection/product/search */
    link_value: model.text().nullable(),
    /** Human-readable label stored for admin display (e.g. category name) */
    link_label: model.text().nullable(),
    sort_order: model.number().default(0),
    is_active: model.boolean().default(true),
})

export default AppHeroSlide
