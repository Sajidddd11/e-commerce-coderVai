"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { useState, useEffect, useMemo } from "react"
import { getProductPrice } from "@lib/util/get-product-price"
import { ProductGridSkeleton } from "./skeleton"

interface CategorySectionClientProps {
  category: HttpTypes.StoreProductCategory
  products: HttpTypes.StoreProduct[]
  imageIndex: number
  demoImages: string[]
}

export default function CategorySectionClient({
  category,
  products: initialProducts,
  imageIndex,
  demoImages,
}: CategorySectionClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState(initialProducts)

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  const categoryImage = useMemo(
    () => demoImages[imageIndex % demoImages.length],
    [imageIndex, demoImages]
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: Category Title Box - Simple Design */}
      <LocalizedClientLink
        href={`/categories/${category.handle}`}
        className="group bg-white border-b border-slate-200 px-6 small:px-8 py-8 small:py-10 hover:border-slate-400 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col small:flex-row small:items-center small:justify-between gap-6"
      >
        <div className="space-y-3 flex-1">
          {/* Subtitle */}
          <span className="text-xs small:text-sm font-semibold tracking-wider uppercase text-slate-500 group-hover:text-slate-700 transition-colors">
            Category
          </span>

          {/* Title */}
          <h3 className="text-2xl small:text-3xl font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
            {category.name}
          </h3>

          {/* Description */}
          {category.description && (
            <p className="text-sm small:text-base text-slate-600 leading-relaxed">
              {category.description}
            </p>
          )}
        </div>

        {/* CTA Link - Right Aligned on Small and Up */}
        <div className="flex items-center gap-2 text-slate-700 font-semibold group-hover:gap-3 transition-all whitespace-nowrap">
          <span>View Collection</span>
          <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
        </div>
      </LocalizedClientLink>

      {/* Row 2: Product Grid (8 Products) */}
      <div className="h-[300px] overflow-hidden">
        {isLoading || !products || products.length === 0 ? (
          <ProductGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-6 gap-3 small:gap-4 h-full">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCard({
  product,
  index,
}: {
  product: HttpTypes.StoreProduct
  index: number
}) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const imageUrl = product.images?.[0]?.url
  const { cheapestPrice } = getProductPrice({ product })
  const formattedPrice = cheapestPrice?.calculated_price
    ? cheapestPrice.calculated_price
    : "Contact for price"

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden animate-fadeIn hover:-translate-y-1"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Image Container */}
      <div className="relative w-full bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden" style={{ aspectRatio: "3/4" }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className={`object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            quality={85}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        ) : null}

        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
        )}

        {/* Hover Overlay - Gradient Background (no opacity on image) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Badges Container */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          {/* New Badge */}
          <span className="inline-flex items-center px-3 py-1.5 bg-white/95 backdrop-blur-md text-orange-600 text-xs font-bold rounded-full shadow-md transform -translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            ✨ New
          </span>

          {/* Quick View CTA - Hidden by default, shows on hover */}
          <span className="inline-flex items-center px-3 py-1.5 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-semibold rounded-full shadow-md transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            Quick View →
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-4 small:p-6 bg-white">
        {/* Product Title */}
        <h3 className="text-sm small:text-base font-bold text-slate-900 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300 mb-2">
          {product.title}
        </h3>

        {/* Product Description/Category */}
        <p className="text-xs text-slate-500 mb-4 flex-grow line-clamp-2">
          {product.description ? product.description.substring(0, 60) + "..." : "Quality product"}
        </p>

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

          {/* Variants Info */}
          <div className="text-right">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 group-hover:bg-orange-100 rounded-lg text-xs font-bold text-slate-700 group-hover:text-orange-600 transition-all duration-300">
              {product.variants?.length || 1}
            </span>
            <p className="text-xs text-slate-500 mt-1">Variant{(product.variants?.length || 1) !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}