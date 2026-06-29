import { Suspense } from "react"
import { listCategories } from "@lib/data/categories"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import FilterPanelClient from "@modules/store/components/filter-panel/filter-panel-client"
import ActiveFilters from "@modules/store/components/active-filters"
import MobileFilterDropdown from "@modules/store/components/mobile-filter-dropdown"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  search,
  categoryIds,
  priceMin,
  priceMax,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  search?: string
  categoryIds?: string[]
  priceMin?: number
  priceMax?: number
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  // Fetch categories here to pass to both FilterPanelClient (sidebar) and ActiveFilters
  let categories: any[] = []
  try {
    const allCategories = await listCategories({ limit: 100 })
    categories = allCategories
      .filter((cat) => cat.products && cat.products.length > 0)
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
  } catch (e) {
    // Ignore error
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-grey-5">
      <div className="content-container py-6 small:py-8 medium:py-12">
        {/* Header */}
        <div className="mb-8 small:mb-10 medium:mb-12">
          <h1 className="text-2xl small:text-3xl medium:text-4xl font-bold text-grey-90 mb-2 small:mb-3" data-testid="store-page-title">
            {search
              ? `Search Results for "${search}"`
              : categoryIds && categoryIds.length > 0
              ? "Filtered Products"
              : "All Products"}
          </h1>
          <p className="text-grey-60 text-xs small:text-sm medium:text-base">
            {search
              ? `Found products matching your search`
              : "Discover our complete collection of premium clothing and accessories"}
          </p>
        </div>

        {/* Mobile Filter Dropdown Drawer */}
        <MobileFilterDropdown sortBy={sort} />

        {/* Layout Container - Filters and Products */}
        <div className="flex flex-col small:flex-row gap-6 small:gap-8">
          {/* Sidebar - Filters - Desktop only */}
          <div className="hidden small:block w-full small:w-56 medium:w-64 flex-shrink-0">
            <div className="sticky top-20 small:top-24 bg-white rounded-xl p-4 small:p-6 border border-grey-20 shadow-sm">
              <FilterPanelClient categories={categories} />
            </div>
          </div>

          {/* Main Content - Products */}
          <div className="flex-1 min-w-0">
            {/* Active Filters chip bar */}
            <ActiveFilters categories={categories} />

            <Suspense fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                countryCode={countryCode}
                search={search}
                categoryIds={categoryIds}
                priceMin={priceMin}
                priceMax={priceMax}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
