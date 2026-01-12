"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductRating from "@modules/products/components/product-rating"
import { getProductPrice } from "@lib/util/get-product-price"
import ResponsivePrice from "@modules/common/components/responsive-price"
import { useState } from "react"
import ReactMarkdown from "react-markdown"

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

  // Check if variants have different prices
  const hasPriceDifference = (() => {
    if (!product.variants || product.variants.length <= 1) {
      return false
    }

    // Get unique prices from all variants
    const prices = product.variants
      .map(v => v.calculated_price?.calculated_amount)
      .filter(price => price !== undefined && price !== null)

    // Check if there are different prices
    const uniquePrices = new Set(prices)
    return uniquePrices.size > 1
  })()

  return (
    <div id="product-info" className="flex flex-col gap-2 font-['Ubuntu']">
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
        <h1 className="text-3xl small:text-4xl font-bold text-slate-900 leading-tight">
          {product.title}
        </h1>
        {/* Product Subtitle with Markdown */}
        {product.subtitle && (() => {
          const text = product.subtitle

          // Split by newlines to handle multi-line content
          const lines = text.split('\n').filter(line => line.trim())

          return (
            <div className="mt-2 text-base leading-relaxed text-slate-700 space-y-1">
              {lines.map((line, lineIndex) => {
                const parts: React.ReactNode[] = []
                let lastIndex = 0

                // Check if line starts with bullet
                const isBullet = line.trim().startsWith('*')
                const cleanLine = isBullet ? line.trim().substring(1).trim() : line

                // Parse bold text (**text**)
                const boldRegex = /\*\*(.*?)\*\*/g
                let match

                while ((match = boldRegex.exec(cleanLine)) !== null) {
                  // Add text before bold
                  if (match.index > lastIndex) {
                    parts.push(cleanLine.substring(lastIndex, match.index))
                  }

                  // Add bold text
                  parts.push(
                    <strong key={match.index} className="font-bold text-slate-900">
                      {match[1]}
                    </strong>
                  )

                  lastIndex = match.index + match[0].length
                }

                // Add remaining text
                if (lastIndex < cleanLine.length) {
                  parts.push(cleanLine.substring(lastIndex))
                }

                return (
                  <div key={lineIndex} className="flex gap-2">
                    {isBullet && <span className="text-slate-400">•</span>}
                    <span>{parts}</span>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>
      {/* Price - main price + optional discount price and percentage */}
      {cheapestPrice && (
        <div className="space-y-2">
          {/* "Starting from" segment - only when variants have different prices */}
          {hasPriceDifference && (
            <div className="flex items-baseline gap-3">
              <span className="text-base font-medium text-slate-700">Starting from</span>

              {/* Main price (current price) - Blue color */}
              <ResponsivePrice
                formattedPrice={cheapestPrice.calculated_price}
                baseClassName="text-2xl small:text-3xl font-bold text-blue-600"
              />

              {/* Discount/base price - faded black */}
              {hasDiscount && (
                <span className="text-sm small:text-base text-slate-400 line-through">
                  {cheapestPrice.original_price}
                </span>
              )}
            </div>
          )}

          {/* Discount percentage on its own line */}
          {hasPriceDifference && hasDiscount && (
            <div className="text-sm font-semibold text-orange-600">
              -{cheapestPrice.percentage_diff}%
            </div>
          )}

          {/* Product Category */}
          {product.type && (
            <p className="text-base font-medium text-slate-800">{product.type.value}</p>
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
                className="flex items-start gap-2 text-sm font-medium text-slate-800"
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
        <div className="border-t border-slate-100 pt-3 space-y-1 text-sm">
          <div className="grid grid-cols-2 gap-2 text-slate-800">
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
