import { listCategories } from "@lib/data/categories"
import { SortOptions } from "../refinement-list/sort-products"
import MobileFilterDropdownClient from "./client"

const MobileFilterDropdown = async ({ sortBy }: { sortBy: SortOptions }) => {
  try {
    const allCategories = await listCategories({ limit: 100 })
    const categories = allCategories
      .filter((cat) => cat.products && cat.products.length > 0)
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""))

    return <MobileFilterDropdownClient sortBy={sortBy} categories={categories} />
  } catch (error) {
    return <MobileFilterDropdownClient sortBy={sortBy} categories={[]} />
  }
}

export default MobileFilterDropdown
