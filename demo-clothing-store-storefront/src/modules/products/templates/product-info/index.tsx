"use client"

import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductRating from "@modules/products/components/product-rating"
import ProductPrice from "@modules/products/components/product-price"
import { useState } from "react"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // Extract features from product description or attributes
  const defaultFeatures = [
    "Premium quality materials",
    "Comfortable fit",
    "Durable construction",
    "Easy care & maintenance",
  ]

  const features = product.tags?.map(tag => tag.value) || defaultFeatures

  return (
    <div id="product-info" className="flex flex-col gap-6">
      {/* Collection Breadcrumb */}
      {product.collection && (
        <LocalizedClientLink
          href={`/collections/${product.collection.handle}`}
          className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wide"
        >
          {product.collection.title}
        </LocalizedClientLink>
      )}

      {/* Product Title */}
      <Heading
        level="h1"
        className="text-4xl small:text-5xl font-bold text-slate-900 leading-tight"
        data-testid="product-title"
      >
        {product.title}
      </Heading>

      {/* Rating and Reviews */}
      <ProductRating averageRating={4.5} reviewCount={24} />

      {/* Price Display */}
      <div className="border-y border-slate-200 py-4">
        <div className="flex items-baseline gap-3">
          <div className="text-3xl small:text-4xl font-bold text-slate-900">
            <ProductPrice product={product} />
          </div>
        </div>
      </div>

      {/* Short Description */}
      {product.description && (
        <div className="space-y-3">
          <Text
            className="text-base text-slate-600 leading-relaxed"
            data-testid="product-description"
          >
            {isDescriptionExpanded || product.description.length < 200
              ? product.description
              : `${product.description.substring(0, 200)}...`}
          </Text>
          {product.description.length > 200 && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors"
            >
              {isDescriptionExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {/* Key Features */}
      {features && features.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Key Features
          </h3>
          <ul className="grid grid-cols-1 small:grid-cols-2 gap-3">
            {features.slice(0, 4).map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm text-slate-700"
              >
                <span className="text-slate-400 mt-1 flex-shrink-0">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dimensions and Details */}
      {(product.weight || product.length || product.width || product.height) && (
        <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
          <h4 className="font-semibold text-slate-900">Dimensions & Details</h4>
          <div className="grid grid-cols-2 gap-3 text-slate-600">
            {product.weight && (
              <div>
                <span className="font-medium">Weight:</span> {product.weight}g
              </div>
            )}
            {product.length && product.width && product.height && (
              <div>
                <span className="font-medium">Size:</span> {product.length}L × {product.width}W × {product.height}H
              </div>
            )}
            {product.material && (
              <div>
                <span className="font-medium">Material:</span> {product.material}
              </div>
            )}
            {product.type?.value && (
              <div>
                <span className="font-medium">Type:</span> {product.type.value}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="flex items-center gap-4 pt-2 text-xs text-slate-600 border-t border-slate-200">
        <div className="flex items-center gap-1">
          <span>✓</span>
          <span>Free Shipping on orders over $50</span>
        </div>
        <div className="flex items-center gap-1">
          <span>✓</span>
          <span>30-day returns</span>
        </div>
      </div>
    </div>
  )
}

export default ProductInfo
