"use client"

import { getProductPrice } from "@lib/util/get-product-price"
import { addToCart, clearCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import OptionSelect from "../product-actions/option-select"
import ColorSwatchSelector from "../color-swatch-selector"
import DotSpinner from "@modules/common/components/dot-spinner"
import QuickBuyDrawer from "../quick-buy-drawer"
import { useState, useMemo, useRef } from "react"
import { isEqual } from "lodash"
import { useParams, useRouter } from "next/navigation"

type ProductPreviewProps = {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductPreview({
  product,
  isFeatured,
  region,
}: ProductPreviewProps) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const countryCode = useParams().countryCode as string
  const router = useRouter()

  const [imageLoaded, setImageLoaded] = useState(false)
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const isNew = product.created_at &&
    new Date(product.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000

  const inStock = product.variants?.some(
    (v) => !v.manage_inventory || (v.inventory_quantity || 0) > 0
  ) ?? true

  // Calculate pricing using the formatted strings from getProductPrice
  const basePrice =
    cheapestPrice?.original_price_number ??
    cheapestPrice?.calculated_price_number ??
    0
  const discountedPrice = cheapestPrice?.calculated_price_number ?? 0

  // Use backend-provided percentage diff when available
  const rawDiscountPercentage = Number(cheapestPrice?.percentage_diff ?? 0)

  // Rounded percentage we show in the UI
  const discountPercentage = Math.floor(rawDiscountPercentage)

  // Treat as a real discount only when:
  // - There is a sale price list (price_type === "sale")
  // - Base price is greater than discounted price
  // - Discounted price is > 0
  // - Effective percentage is at least 1%
  const hasDiscount =
    !!cheapestPrice &&
    cheapestPrice.price_type === "sale" &&
    basePrice > discountedPrice &&
    discountedPrice > 0 &&
    discountPercentage >= 1

  // Use formatted prices directly
  const formattedBasePrice = cheapestPrice?.original_price || cheapestPrice?.calculated_price || "Contact for price"
  const formattedDiscountedPrice = cheapestPrice?.calculated_price || "Contact for price"

  // Find selected variant
  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return undefined
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // Check if selected options are valid
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // Check if variant is in stock
  const isSelectedVariantInStock = useMemo(() => {
    if (!selectedVariant) return false

    if (!selectedVariant.manage_inventory) {
      return true
    }

    if (selectedVariant?.allow_backorder) {
      return true
    }

    if ((selectedVariant?.inventory_quantity || 0) > 0) {
      return true
    }

    return false
  }, [selectedVariant])

  // Determine if Add to Cart button should be enabled
  const canAddToCart = useMemo(() => {
    if (!inStock) return false

    // If single variant or no variants, button is enabled by default
    if ((product.variants?.length ?? 0) <= 1) {
      return true
    }

    // If multiple variants, require valid selection and in stock
    return isValidVariant && isSelectedVariantInStock
  }, [product.variants?.length, isValidVariant, isSelectedVariantInStock, inStock])

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  // Extract color option
  const colorOption = product.options?.find(
    (opt) => opt.title?.toLowerCase() === "color"
  )
  const colorValues = colorOption
    ? product.variants
      ?.flatMap((v) =>
        v.options
          ?.filter((opt) => opt.option_id === colorOption.id)
          .map((opt) => ({ id: opt.option_id, value: opt.value }))
      )
      .filter(Boolean)
      .reduce((acc: any[], curr: any) => {
        if (!acc.find((c) => c.value === curr?.value)) {
          acc.push(curr)
        }
        return acc
      }, [])
    : []

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const variantToAdd = selectedVariant || product.variants?.[0]
    if (!variantToAdd?.id) return

    setIsAdding(true)

    try {
      await addToCart({
        variantId: variantToAdd.id,
        quantity: 1,
        countryCode,
      })
    } finally {
      setIsAdding(false)
    }
  }

  // Buy now: clear cart, add this product only, and navigate to checkout
  const handleBuyNow = async () => {
    const variantToAdd = selectedVariant || product.variants?.[0]
    if (!variantToAdd?.id) return

    setIsAdding(true)

    try {
      // Clear existing cart items first (Buy Now is for this item only)
      await clearCart()

      await addToCart({
        variantId: variantToAdd.id,
        quantity: 1,
        countryCode,
      })

      // Navigate to checkout page
      router.push(`/${countryCode}/checkout?step=address`)
    } finally {
      setIsAdding(false)
      setIsDrawerOpen(false)
    }
  }

  // Handle button click - open drawer for products with variants on desktop
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Check if we're on desktop (medium breakpoint = 1024px)
    const isDesktop = window.innerWidth >= 1024

    // If product has variants AND we're on desktop, open drawer
    if (hasVariants && isDesktop) {
      setIsDrawerOpen(true)
    } else {
      // Mobile or no variants - directly add to cart
      handleAddToCart(e)
    }
  }

  // Handle card click - navigate only if not clicking on interactive elements
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent multiple clicks
    if (isNavigating || isAdding) {
      e.preventDefault()
      return
    }

    const target = e.target as HTMLElement

    // Don't navigate if clicking on interactive elements
    if (target.closest('button') || target.closest('[role="button"]')) {
      return
    }

    // Show loading state during navigation immediately
    setIsNavigating(true)
    e.preventDefault()
    e.stopPropagation()

    // Ensure loading state is visible for a moment before navigation
    setTimeout(() => {
      router.push(`/products/${product.handle}`)
    }, 100)
  }

  const hasVariants = (product.variants?.length ?? 0) > 1

  return (
    <div
      ref={cardRef}
      className={`group relative flex flex-col h-fit w-full bg-white shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer ${isNavigating ? 'opacity-75' : ''
        }`}
      onClick={handleCardClick}
      data-clickable="true"
    >
      {/* Image Container - 1:1 Ratio, Max 300px */}
      <div className="relative mx-auto w-full max-w-[300px] aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
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

        {/* Stock Status Indicator */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
            <span className="text-white font-bold text-sm">Out of Stock</span>
          </div>
        )}

        {/* Loading Overlay */}
        {isNavigating && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 shadow-2xl">
            <div className="flex flex-col items-center gap-3">
              <DotSpinner size="lg" color="#262626" />
              <p className="text-sm font-semibold text-slate-700">Opening...</p>
            </div>
          </div>
        )}
      </div>

      {/* Discount Badge - show only when there is a real discount */}
      {hasDiscount && (
        <div className="absolute top-1 right-1 px-3 py-[1px] bg-red-500 flex items-center justify-center shadow-2xl  z-20">
          <span className="text-white font-bold text-md text-center">
            {discountPercentage}%
            <span className="text-xs"> off</span>
          </span>
        </div>
      )}

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-2 small:p-3 medium:p-4 bg-gray-100">
        {/* Product Type */}
        {product.type && (
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
            {product.type.value || "Product"}
          </p>
        )}

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2">
          {product.title}
        </h3>

        {/* Pricing Section */}
        <div className="space-y-1 mb-3 pt-2">
          {/* Current Price (highlighted) */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Price:</span>
            <span className="text-lg font-bold text-slate-900">
              {formattedDiscountedPrice}
            </span>
          </div>

          {/* Show base price and discount only when there is a real discount */}
          {hasDiscount && (
            <>
              {/* Base Price (strikethrough) */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Base Price:</span>
                <span className="text-xs font-semibold text-slate-400 line-through">
                  {formattedBasePrice}
                </span>
              </div>

              {/* Discount Percentage */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Discount:</span>
                <span className="text-xs font-semibold text-red-600">
                  {discountPercentage}%
                </span>
              </div>
            </>
          )}
        </div>

        {/* Variant Options - Only show on mobile, hidden on desktop (shown in drawer instead) */}
        {hasVariants && (
          <div
            className="medium:hidden pt-1 space-y-1 border-slate-200 mb-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Color Swatches */}
            {colorValues && colorValues.length > 0 && (
              <ColorSwatchSelector
                colorOptions={colorValues as any}
                selectedColor={options[colorOption!.id]}
                onColorSelect={setOptionValue}
                disabled={isAdding}
              />
            )}

            {/* Other Options */}
            {(product.options || []).map((option) => {
              // Skip color option if already displayed with swatches
              if (colorOption && option.id === colorOption.id) {
                return null
              }
              return (
                <div key={option.id}>
                  <OptionSelect
                    option={option}
                    current={options[option.id]}
                    updateOption={setOptionValue}
                    title={option.title ?? ""}
                    disabled={isAdding}
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* Add to Cart Button */}
        <div className="">
          <button
            onClick={handleButtonClick}
            disabled={typeof window !== 'undefined' && window.innerWidth >= 1024 && hasVariants ? false : (!canAddToCart || isAdding)}
            className={`w-full py-2 px-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${(typeof window !== 'undefined' && window.innerWidth >= 1024 && hasVariants) || (canAddToCart && !isAdding)
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
              }`}
          >
            {isAdding ? (
              <>
                <DotSpinner size="sm" color="#ffffff" />
                <span>Adding</span>
              </>
            ) : !inStock ? (
              "Out of Stock"
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>


      </div>

      {/* Quick Buy Drawer - Desktop Only */}
      <QuickBuyDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        product={product}
        colorOption={colorOption}
        colorValues={colorValues || []}
        options={options}
        selectedVariant={selectedVariant}
        isValidVariant={!!isValidVariant}
        inStock={inStock}
        isAdding={isAdding}
        onOptionSelect={setOptionValue}
        onAddToCart={async () => {
          await handleAddToCart()
          setIsDrawerOpen(false)
        }}
        onBuyNow={handleBuyNow}
      />
    </div>
  )
}
