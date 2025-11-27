"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import QuantitySelector from "@modules/products/components/quantity-selector"
import ColorSwatchSelector from "@modules/products/components/color-swatch-selector"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: quantity,
      countryCode,
    })

    setIsAdding(false)
  }

  // Extract color options if available
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

  return (
    <>
      <div className="flex flex-col gap-y-6" ref={actionsRef}>
        {/* Variant Options */}
        {colorValues && colorValues.length > 0 && (
          <ColorSwatchSelector
            colorOptions={colorValues as any}
            selectedColor={options[colorOption!.id]}
            onColorSelect={setOptionValue}
            disabled={!!disabled || isAdding}
          />
        )}

        {/* Other Options */}
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
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
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Price Display */}
        <div className="border-y border-slate-200 py-4">
          <ProductPrice product={product} variant={selectedVariant} />
        </div>

        {/* Quantity Selector */}
        {inStock && selectedVariant && (
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={setQuantity}
            maxQuantity={selectedVariant.inventory_quantity || 999}
            disabled={!!disabled || isAdding}
          />
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              !isValidVariant
            }
            variant="primary"
            className="w-full h-12 text-base font-semibold"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant && !options
              ? "Select variant"
              : !inStock || !isValidVariant
              ? "Out of stock"
              : "Add to Cart"}
          </Button>

          {/* Buy Now Button */}
          <Button
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              !isValidVariant
            }
            variant="secondary"
            className="w-full h-12 text-base font-semibold border-slate-300"
            data-testid="buy-now-button"
          >
            Buy Now
          </Button>
        </div>

        {/* Stock Status */}
        {selectedVariant && (
          <div className="text-sm">
            {inStock ? (
              <p className="text-green-600 font-medium flex items-center gap-2">
                <span>✓</span>
                {selectedVariant.manage_inventory
                  ? `${selectedVariant.inventory_quantity || 0} in stock`
                  : "In stock"}
              </p>
            ) : (
              <p className="text-red-600 font-medium">Out of stock</p>
            )}
          </div>
        )}

        {/* Trust Badges */}
        <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <span>✓</span>
            <span>Secure checkout with multiple payment options</span>
          </div>
          <div className="flex items-start gap-2">
            <span>✓</span>
            <span>Money-back guarantee if not satisfied</span>
          </div>
        </div>

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
