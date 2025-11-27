import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="content-container py-8 small:py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl small:text-4xl font-bold text-slate-900 mb-3" data-testid="store-page-title">
            All Products
          </h1>
          <p className="text-slate-600 text-sm small:text-base">
            Discover our complete collection of premium clothing and accessories
          </p>
        </div>

        {/* Layout Container */}
        <div className="flex flex-col small:flex-row gap-8">
          {/* Sidebar - Filters */}
          <div className="w-full small:w-64 flex-shrink-0">
            <div className="sticky top-20 bg-white rounded-lg p-6 border border-slate-200">
              <RefinementList sortBy={sort} />
            </div>
          </div>

          {/* Main Content - Products */}
          <div className="flex-1">
            <Suspense fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                countryCode={countryCode}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
