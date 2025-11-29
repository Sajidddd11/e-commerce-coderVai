import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let products: HttpTypes.StoreProduct[] = []

  // If product has a category, fetch latest 5 from that category
  if (product.categories && product.categories.length > 0) {
    const primaryCategory = product.categories[0]

    const categoryQueryParams: HttpTypes.StoreProductListParams = {
      region_id: region.id,
      category_id: [primaryCategory.id],
      is_giftcard: false,
    }

    products = await listProducts({
      queryParams: categoryQueryParams,
      countryCode,
    }).then(({ response }) => {
      return response.products
        .filter((responseProduct) => responseProduct.id !== product.id)
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
          return dateB - dateA
        })
        .slice(0, 5)
    })
  }

  // If no products from category or no category, fetch latest 5 from all products
  if (!products || products.length === 0) {
    const allProductsParams: HttpTypes.StoreProductListParams = {
      region_id: region.id,
      is_giftcard: false,
    }

    products = await listProducts({
      queryParams: allProductsParams,
      countryCode,
    }).then(({ response }) => {
      return response.products
        .filter((responseProduct) => responseProduct.id !== product.id)
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
          return dateB - dateA
        })
        .slice(0, 5)
    })
  }

  if (!products || products.length === 0) {
    return null
  }

  const categoryPath = product.categories && product.categories.length > 0
    ? `/categories/${product.categories[0].handle}`
    : "/store"

  return (
    <div className="w-full">
      {/* Product Grid - Latest 5 Products */}
      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-5 gap-4 justify-items-center">
        {products.map((product) => (
          <li key={product.id} className="h-full">
            <Product region={region} product={product} />
          </li>
        ))}
      </ul>

      {/* Explore More Button */}
      <div className="flex justify-center mt-8">
        <LocalizedClientLink
          href={categoryPath}
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors duration-200"
        >
          Explore More Products
          <span>→</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
