import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="content-container py-8 small:py-12">
        {/* Breadcrumb Navigation */}
        <div className="mb-8 flex items-center gap-2 text-sm text-slate-600">
          <LocalizedClientLink href="/" className="hover:text-slate-900 transition-colors">
            Home
          </LocalizedClientLink>
          <span>/</span>
          {parents && parents.length > 0 && (
            <>
              {parents.slice().reverse().map((parent) => (
                <div key={parent.id} className="flex items-center gap-2">
                  <LocalizedClientLink
                    href={`/categories/${parent.handle}`}
                    className="hover:text-slate-900 transition-colors"
                    data-testid="sort-by-link"
                  >
                    {parent.name}
                  </LocalizedClientLink>
                  <span>/</span>
                </div>
              ))}
            </>
          )}
          <span className="text-slate-900 font-medium">{category.name}</span>
        </div>

        {/* Category Header */}
        <div className="mb-12">
          <h1 className="text-3xl small:text-4xl font-bold text-slate-900 mb-3" data-testid="category-page-title">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-slate-600 text-base max-w-2xl">
              {category.description}
            </p>
          )}
        </div>

        {/* Subcategories */}
        {category.category_children && category.category_children.length > 0 && (
          <div className="mb-12 pb-8 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Subcategories
            </h2>
            <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-4">
              {category.category_children.map((c) => (
                <InteractiveLink
                  key={c.id}
                  href={`/categories/${c.handle}`}
                  className="px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-all text-sm font-medium text-slate-900"
                >
                  {c.name}
                </InteractiveLink>
              ))}
            </div>
          </div>
        )}

        {/* Layout Container */}
        <div className="flex flex-col small:flex-row gap-8">
          {/* Sidebar - Filters */}
          <div className="w-full small:w-64 flex-shrink-0">
            <div className="sticky top-20 bg-white rounded-lg p-6 border border-slate-200">
              <RefinementList sortBy={sort} data-testid="sort-by-container" />
            </div>
          </div>

          {/* Main Content - Products */}
          <div className="flex-1">
            <Suspense
              fallback={
                <SkeletonProductGrid
                  numberOfProducts={category.products?.length ?? 8}
                />
              }
            >
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                categoryId={category.id}
                countryCode={countryCode}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
