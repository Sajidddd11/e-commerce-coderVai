import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 25

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  search,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  search?: string
}) {
  const queryParams: PaginatedProductsParams & { q?: string } = {
    limit: 25,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (search) {
    queryParams["q"] = search
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  if (products.length === 0) {
    return (
      <div className="w-full py-16 px-4 text-center ">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-slate-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8-4m-8 4v10l8-4M7 7l5-2.5 5 2.5"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No Products Found
          </h3>
          <p className="text-slate-600 mb-6">
            {search
              ? "We couldn't find any products matching your search. Try adjusting your search terms or browsing by category."
              : "There are no products available in this selection. Please check back soon or explore other categories."}
          </p>
          <a
            href="/store"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Browse All Products
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <ul
        className="columns-2 small:grid small:grid-cols-3 medium:grid-cols-5 gap-2 small:gap-3 medium:gap-3"
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id} className="break-inside-avoid mb-2 small:mb-0">
              <ProductPreview product={p} region={region} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            data-testid="product-pagination"
            page={page}
            totalPages={totalPages}
          />
        </div>
      )}
    </>
  )
}
