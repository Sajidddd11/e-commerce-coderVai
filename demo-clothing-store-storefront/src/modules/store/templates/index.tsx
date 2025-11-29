import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  search,
  categoryId,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  search?: string
  categoryId?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-grey-5">
      <div className="content-container py-6 small:py-8 medium:py-12">
        {/* Header */}
        <div className="mb-8 small:mb-10 medium:mb-12">
          <h1 className="text-2xl small:text-3xl medium:text-4xl font-bold text-grey-90 mb-2 small:mb-3" data-testid="store-page-title">
            {search
              ? `Search Results for "${search}"`
              : categoryId
              ? "Category Products"
              : "All Products"}
          </h1>
          <p className="text-grey-60 text-xs small:text-sm medium:text-base">
            {search
              ? `Found products matching your search`
              : "Discover our complete collection of premium clothing and accessories"}
          </p>
        </div>

        {/* Layout Container - Filters and Products */}
        <div className="flex flex-col small:flex-row gap-6 small:gap-8">
          {/* Sidebar - Filters - Sticky on desktop, collapsible on mobile */}
          <div className="w-full small:w-56 medium:w-64 flex-shrink-0">
            <div className="sticky top-20 small:top-24 bg-white rounded-lg p-4 small:p-6 border border-grey-20">
              <RefinementList sortBy={sort} />
            </div>
          </div>

          {/* Main Content - Products */}
          <div className="flex-1 min-w-0">
            <Suspense fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                countryCode={countryCode}
                search={search}
                categoryId={categoryId}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
