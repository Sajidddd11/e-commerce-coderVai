import { HttpTypes } from "@medusajs/types"
import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"
import { listProducts } from "@lib/data/products"

interface FeaturedProductsShowcaseProps {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
}

export default async function FeaturedProductsShowcase({
  collections,
  region,
}: FeaturedProductsShowcaseProps) {
  const collectionWithProducts = await Promise.all(
    collections.slice(0, 3).map(async (collection) => {
      const {
        response: { products },
      } = await listProducts({
        regionId: region.id,
        queryParams: {
          collection_id: collection.id,
          fields: "*variants.calculated_price",
          limit: 4,
        },
      })

      return {
        ...collection,
        products: products || [],
      }
    })
  )

  return (
    <div className="w-full bg-white py-12 small:py-16 medium:py-24">
      <div className="content-container">
        <div className="flex flex-col gap-8 small:gap-12 medium:gap-16">
          {collectionWithProducts.map((collection, index) => (
            <div key={collection.id} className="flex flex-col gap-8">
              {/* Header */}
              <div className="flex flex-col small:flex-row small:items-center small:justify-between gap-3 small:gap-0">
                <div className="flex flex-col gap-1 small:gap-2">
                  <h3 className="text-lg xsmall:text-2xl small:text-3xl font-bold text-slate-900">
                    {collection.title}
                  </h3>
                  <p className="text-slate-600 text-xs xsmall:text-sm">
                    Handpicked collection just for you
                  </p>
                </div>
                <InteractiveLink
                  href={`/collections/${collection.handle}`}
                  className="inline-flex items-center gap-2 text-slate-900 hover:text-slate-600 font-semibold text-xs xsmall:text-sm group transition-colors w-fit"
                >
                  View Collection
                  <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </InteractiveLink>
              </div>

              {/* Products Grid */}
              {collection.products && collection.products.length > 0 ? (
                <div className="grid grid-cols-2 xsmall:grid-cols-2 small:grid-cols-3 medium:grid-cols-4 large:grid-cols-5 gap-3 xsmall:gap-4 small:gap-4 medium:gap-5 large:gap-6">
                  {collection.products.map((product) => (
                    <div
                      key={product.id}
                      className="group h-full rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg border border-grey-20 shadow-sm"
                    >
                      <ProductPreview
                        product={product}
                        region={region}
                        isFeatured
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 bg-slate-50 rounded-lg">
                  <p className="text-slate-500 text-sm">
                    No products available in this collection
                  </p>
                </div>
              )}

              {/* Divider between collections */}
              {index < collectionWithProducts.length - 1 && (
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-6 small:my-8 medium:my-12" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
