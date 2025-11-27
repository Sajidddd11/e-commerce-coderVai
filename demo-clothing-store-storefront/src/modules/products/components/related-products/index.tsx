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

  // edit this function to define your related products logic
  const queryParams: HttpTypes.StoreProductListParams = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
    return null
  }

  const collectionPath = product.collection
    ? `/collections/${product.collection.handle}`
    : "/store"

  return (
    <div className="w-full">
      {/* Product Grid */}
      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-4 small:gap-6 mb-8">
        {products.slice(0, 8).map((product) => (
          <li key={product.id} className="h-full">
            <Product region={region} product={product} />
          </li>
        ))}
      </ul>

      {/* See More Button */}
      {products.length > 8 && (
        <div className="flex justify-center mt-8">
          <LocalizedClientLink
            href={collectionPath}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors duration-200"
          >
            See More Related Products
            <span>→</span>
          </LocalizedClientLink>
        </div>
      )}
    </div>
  )
}
