import { listCategories } from "@lib/data/categories"
import FilterPanelClient from "./filter-panel-client"

export default async function FilterPanel() {
  try {
    const allCategories = await listCategories({ limit: 100 })
    
    // Filter out categories with no products and sort by name
    const categories = allCategories
      .filter((cat) => cat.products && cat.products.length > 0)
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""))

    return <FilterPanelClient categories={categories} />
  } catch (error) {
    // Fallback if load fails
    return <FilterPanelClient categories={[]} />
  }
}
