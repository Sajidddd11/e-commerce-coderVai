import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="content-container py-8 small:py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl small:text-4xl font-bold text-slate-900 mb-3">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="text-slate-600 text-base max-w-2xl">
              {collection.description}
            </p>
          )}
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
            <Suspense
              fallback={
                <SkeletonProductGrid
                  numberOfProducts={collection.products?.length}
                />
              }
            >
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                collectionId={collection.id}
                countryCode={countryCode}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
