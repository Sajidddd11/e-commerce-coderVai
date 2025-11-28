"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductRating from "@modules/products/components/product-rating"
import ProductPrice from "@modules/products/components/product-price"
import { useState } from "react"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

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
        <h1 className="text-2xl small:text-3xl font-bold text-slate-900 leading-tight mb-2">
          {product.title}
        </h1>
        {product.type && (
          <p className="text-sm text-slate-500">{product.type.value}</p>
        )}
      </div>

      {/* Rating and Reviews */}
      <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
        <ProductRating averageRating={4.5} reviewCount={24} />
        <span className="text-xs text-slate-500">
          {inStock ? "✓ In Stock" : "Out of Stock"}
        </span>
      </div>

      {/* Price Display - Compact */}
      <div className="flex items-baseline gap-3">
        <div className="text-2xl small:text-3xl font-bold text-slate-900">
          <ProductPrice product={product} />
        </div>
      </div>

      {/* Short Description */}
      {product.description && (
        <div className="space-y-2">
          <p className="text-sm text-slate-600 leading-relaxed">
            {isDescriptionExpanded || product.description.length < 150
              ? product.description
              : `${product.description.substring(0, 150)}...`}
          </p>
          {product.description.length > 150 && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              {isDescriptionExpanded ? "Show less" : "Show more"}
            </button>
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

      {/* Trust Badges - Minimal */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="text-green-600 font-bold">✓</span>
          <span>Free Shipping</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-600 font-bold">✓</span>
          <span>30-day Returns</span>
        </div>
      </div>
    </div>
  )
}

export default ProductInfo