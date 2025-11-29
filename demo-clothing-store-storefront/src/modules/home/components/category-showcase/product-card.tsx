"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { getProductPrice } from "@lib/util/get-product-price"

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
      className="group relative flex flex-col w-full h-full  border border-black-20 rounded-lg overflow-visible shadow-md hover:shadow-lg transition-all duration-300"
      // className=" col-span-1 group relative border border-red-950"
      style={{
        aspectRatio: "1 / 1",
      }}
    >
      {/* Image Container - 1:1 ratio */}
      <div className="relative bg-gray-100 overflow-hidden flex-grow" style={{ aspectRatio: "1 / 1" }}>
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0].url}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-xs">No image</span>
          </div>
        )}

        {/* Discount Circle Badge - Top Right with overflow visible */}
        {discountPercent > 0 && (
          <div className="absolute top-[4px] right-[4px] transform translate-x-1/4 -translate-y-1/4 w-12 h-12 small:w-16 small:h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-20 border small:border-2 border-white">
            <span className="text-white font-bold text-xs small:text-base text-center leading-tight">
              {discountPercent}%<br />
              <span className="text-xs small:text-sm">off</span>
            </span>
          </div>
        )}
      </div>

      {/* Bottom Box - White box with xs shadow, positioned -2px from bottom */}
      <div
        className="relative w-full bg-white/80 shadow-xs flex flex-col items-center justify-center px-2 py-1"
        style={{
          bottom: "-2px",
        }}
      >
        {/* Title */}
        <h3 className="text-xs font-semibold text-gray-900 line-clamp-1 text-center w-full">
          {product.title}
        </h3>

        {/* Prices */}
        <div className="flex items-center justify-center gap-1 text-center">
          {discountPercent > 0 ? (
            <>
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(basePrice)}
              </span>
              <span className="text-xs font-bold text-red-600">
                {formatPrice(salePrice)}
              </span>
            </>
          ) : (
            <span className="text-xs font-bold text-gray-900">
              {formatPrice(salePrice)}
            </span>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}

export default ProductCardWithPrice
