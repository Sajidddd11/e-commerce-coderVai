"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductRating from "@modules/products/components/product-rating"
import { getProductPrice } from "@lib/util/get-product-price"
import { useState } from "react"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const hasDiscount =
    !!cheapestPrice &&
    cheapestPrice.price_type === "sale" &&
    typeof cheapestPrice.percentage_diff !== "undefined" &&
    Number(cheapestPrice.percentage_diff) > 0 &&
    cheapestPrice.original_price_number >
    cheapestPrice.calculated_price_number

  const defaultFeatures = [
    "Premium quality",
    "Comfortable fit",
    "Durable",
    "Easy care",
  ]

  const features = product.tags?.map(tag => tag.value) || defaultFeatures

  const inStock = product.variants?.some(
    (v) => !v.manage_inventory || (v.inventory_quantity || 0) > 0
  )

  return (
    <div id="product-info" className="flex flex-col gap-4">
      {/* Collection Link */}
      {product.collection && (
        <LocalizedClientLink
          href={`/collections/${product.collection.handle}`}
          className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors uppercase tracking-widest"
        >
          {product.collection.title}
        </LocalizedClientLink>
      )}

      {/* Product Title */}
      <div>
        <h1 className="text-2xl small:text-3xl font-bold text-slate-900 leading-tight mb-1">
          {product.title}
        </h1>
      </div>
      {/* Price - main price + optional discount price and percentage */}
      {cheapestPrice && (
        <div className="space-y-2">
          <div className="flex items-baseline gap-3">
            {/* Main price (current price) */}
            <span className="text-2xl small:text-3xl font-bold text-slate-900">
              {cheapestPrice.calculated_price}
            </span>

            {/* Discount/base price - faded black */}
            {hasDiscount && (
              <span className="text-sm small:text-base text-slate-400 line-through">
                {cheapestPrice.original_price}
              </span>
            )}
          </div>

          {/* Discount percentage on its own line */}
          {hasDiscount && (
            <div className="text-sm font-semibold text-orange-600">
              -{cheapestPrice.percentage_diff}%
            </div>
          )}

          {/* Product Category */}
          {product.type && (
            <p className="text-sm text-slate-600">{product.type.value}</p>
          )}
        </div>
      )}

      {/* Key Features - Compact */}
      {features && features.length > 0 && (
        <div className="space-y-2 pt-2">
          <ul className="grid grid-cols-2 gap-2">
            {features.slice(0, 4).map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-xs text-slate-700"
              >
                <span className="text-orange-500 font-bold flex-shrink-0">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dimensions and Details - Compact */}
      {(product.weight || product.length || product.width || product.height || product.material) && (
        <div className="border-t border-slate-200 pt-3 space-y-1 text-xs">
          <div className="grid grid-cols-2 gap-2 text-slate-600">
            {product.weight && (
              <div>
                <span className="font-semibold">Weight:</span> {product.weight}g
              </div>
            )}
            {product.material && (
              <div>
                <span className="font-semibold">Material:</span> {product.material}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductInfo
