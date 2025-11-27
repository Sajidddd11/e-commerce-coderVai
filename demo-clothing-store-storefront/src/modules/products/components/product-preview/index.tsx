import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group h-full">
      <div data-testid="product-wrapper" className="flex flex-col h-full">
        <div className="relative overflow-hidden rounded-lg bg-slate-100 mb-4 flex-1">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />
        </div>
        <div className="flex flex-col gap-3 py-2">
          <p
            className="text-sm font-medium text-slate-900 group-hover:text-slate-600 transition-colors line-clamp-2"
            data-testid="product-title"
          >
            {product.title}
          </p>
          {cheapestPrice && (
            <div className="flex items-center gap-2">
              <PreviewPrice price={cheapestPrice} />
            </div>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
