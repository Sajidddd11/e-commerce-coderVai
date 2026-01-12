"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { getProductPrice } from "@lib/util/get-product-price"
import ResponsivePrice from "@modules/common/components/responsive-price"

function ProductCardWithPrice({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const { cheapestPrice } = getProductPrice({ product })

  const salePrice = cheapestPrice?.calculated_price_number || 0
  const basePrice = cheapestPrice?.original_price_number || 0

  const discountPercent = basePrice > 0 && salePrice > 0 && salePrice < basePrice
    ? Math.round(((basePrice - salePrice) / basePrice) * 100)
    : 0

  const formatPrice = (price: number) => {
    if (!isFinite(price) || price === 0) return "$0"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cheapestPrice?.currency_code || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group w-full shadow-md hover:shadow-2xl relative overflow-visible rounded-sm transition-all duration-300"

    >
      {/* Image Container - 1:1 ratio */}
      <div className="relative bg-gray-100 overflow-hidden rounded-t-sm flex-grow" style={{ aspectRatio: "1 / 1" }}>
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0].url}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-xs">No image</span>
          </div>
        )}

        {/* Discount Circle Badge - Top Right, only when there is a real discount */}
        {discountPercent > 0 && (
          <div className="absolute top-1 right-1 px-1 rounded-sm py-[1px] bg-red-500 flex items-center justify-center shadow-lg z-20">
            <span className="text-white font-bold text-sm text-center">
              {discountPercent}%
              <span className="text-xs"> off</span>
            </span>
          </div>
        )}
      </div>

      {/* Bottom Box - White box with xs shadow, positioned -2px from bottom */}
      <div
        className="relative w-full px-2 bg-gray-100 hover:bg-gray-100 flex flex-col items-center rounded-b-sm justify-center py-1"

      >
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 text-center w-full">
          {product.title}
        </h3>

        {/* Prices */}
        <div className="flex items-center justify-center gap-1 text-center">
          {discountPercent > 0 ? (
            <>
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(basePrice)}
              </span>
              <ResponsivePrice
                formattedPrice={formatPrice(salePrice)}
                baseClassName="text-base small:text-xl font-bold text-red-600"
              />
            </>
          ) : (
            <ResponsivePrice
              formattedPrice={formatPrice(salePrice)}
              baseClassName="text-base small:text-lg font-bold text-red-600"
            />
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}

export default ProductCardWithPrice
