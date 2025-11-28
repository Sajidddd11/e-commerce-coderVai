"use client"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { useState } from "react"

export default function ProductPreview({
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

  const [imageLoaded, setImageLoaded] = useState(false)

  const isNew = product.created_at &&
    new Date(product.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000

  const inStock = product.variants?.some(
    (v) => !v.manage_inventory || (v.inventory_quantity || 0) > 0
  )

  const formattedPrice = cheapestPrice?.calculated_price
    ? cheapestPrice.calculated_price
    : "Contact for price"

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative w-full bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden" style={{ aspectRatio: "3/4" }}>
        {/* Skeleton Loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse z-0" />
        )}

        {/* Product Image */}
        <div className="relative w-full h-full overflow-hidden">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />
        </div>

        {/* Subtle Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Badges Container */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          {/* Badges */}
          <div className="flex flex-col gap-2">
            {isNew && (
              <span className="inline-flex items-center px-3 py-1.5 bg-white/95 backdrop-blur-md text-orange-600 text-xs font-bold rounded-full shadow-md transform -translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 w-fit">
                ✨ New
              </span>
            )}
            {isFeatured && (
              <span className="inline-flex items-center px-3 py-1.5 bg-white/95 backdrop-blur-md text-pink-600 text-xs font-bold rounded-full shadow-md transform -translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 w-fit">
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Quick View CTA - Hidden by default */}
          <span className="inline-flex items-center px-3 py-1.5 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-semibold rounded-full shadow-md transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            Quick View →
          </span>
        </div>

        {/* Stock Status Indicator */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
            <span className="text-white font-bold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-4 small:p-6 bg-white">
        {/* Category/Type */}
        {product.type && (
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            {product.type.value || "Product"}
          </p>
        )}

        {/* Title */}
        <h3 className="text-sm small:text-base font-bold text-slate-900 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300 mb-2">
          {product.title}
        </h3>

        {/* Description Preview */}
        {product.description && (
          <p className="text-xs text-slate-500 mb-4 flex-grow line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Divider */}
        <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full mb-4" />

        {/* Footer Section */}
        <div className="flex items-center justify-between pt-2">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Price</span>
            <span className="text-lg small:text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors duration-300">
              {formattedPrice}
            </span>
          </div>

          {/* Rating */}
          <div className="text-right">
            <div className="flex items-center justify-center w-8 h-8 bg-slate-100 group-hover:bg-orange-100 rounded-lg transition-all duration-300">
              <span className="text-yellow-400">★</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">4.5</p>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}