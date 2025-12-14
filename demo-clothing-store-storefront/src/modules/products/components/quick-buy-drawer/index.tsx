"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import ColorSwatchSelector from "../color-swatch-selector"
import OptionSelect from "../product-actions/option-select"
import DotSpinner from "@modules/common/components/dot-spinner"

interface QuickBuyDrawerProps {
    isOpen: boolean
    onClose: () => void
    product: HttpTypes.StoreProduct
    colorOption?: HttpTypes.StoreProductOption
    colorValues: any[]
    options: Record<string, string | undefined>
    selectedVariant?: HttpTypes.StoreProductVariant
    isValidVariant: boolean
    inStock: boolean
    isAdding: boolean
    onOptionSelect: (optionId: string, value: string) => void
    onAddToCart: () => void
    onBuyNow: () => void
}

export default function QuickBuyDrawer({
    isOpen,
    onClose,
    product,
    colorOption,
    colorValues,
    options,
    selectedVariant,
    isValidVariant,
    inStock,
    isAdding,
    onOptionSelect,
    onAddToCart,
    onBuyNow,
}: QuickBuyDrawerProps) {
    if (!isOpen) return null

    const canPurchase = inStock && selectedVariant && isValidVariant && !isAdding

    return (
        <>
            {/* Drawer */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-white z-10 border-t-2 border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hidden medium:block ${isOpen ? "translate-y-0" : "translate-y-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Select Options</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                    {/* Color Swatches */}
                    {colorValues && colorValues.length > 0 && (
                        <ColorSwatchSelector
                            colorOptions={colorValues}
                            selectedColor={options[colorOption!.id]}
                            onColorSelect={onOptionSelect}
                            disabled={isAdding}
                        />
                    )}

                    {/* Other Options */}
                    {(product.options || []).map((option) => {
                        if (colorOption && option.id === colorOption.id) {
                            return null
                        }
                        return (
                            <div key={option.id}>
                                <OptionSelect
                                    option={option}
                                    current={options[option.id]}
                                    updateOption={onOptionSelect}
                                    title={option.title ?? ""}
                                    disabled={isAdding}
                                />
                            </div>
                        )
                    })}

                    {/* Stock Status */}
                    {selectedVariant && (
                        <div className="text-sm pt-2">
                            {inStock ? (
                                <p className="text-green-600 font-medium flex items-center gap-2">
                                    <span>✓</span>
                                    In stock
                                </p>
                            ) : (
                                <p className="text-red-600 font-medium">Out of stock</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="flex gap-2">
                        {/* Add to Cart Button */}
                        <button
                            onClick={onAddToCart}
                            disabled={!canPurchase}
                            className={`flex-1 py-2 px-2 font-semibold text-xs whitespace-nowrap transition-all flex items-center justify-center gap-2 ${canPurchase
                                ? "bg-slate-900 text-white hover:bg-slate-800"
                                : "bg-slate-200 text-slate-500 cursor-not-allowed"
                                }`}
                        >
                            {isAdding ? (
                                <>
                                    <DotSpinner size="sm" color="#ffffff" />
                                    <span>Adding</span>
                                </>
                            ) : !selectedVariant ? (
                                "Select Options"
                            ) : !inStock || !isValidVariant ? (
                                "Out of Stock"
                            ) : (
                                "Add to Cart"
                            )}
                        </button>

                        {/* Buy Now Button */}
                        <button
                            onClick={onBuyNow}
                            disabled={!canPurchase}
                            className={`flex-1 py-2 px-2 font-semibold text-xs whitespace-nowrap transition-all border ${canPurchase
                                ? "bg-white border-slate-900 text-slate-900 hover:bg-slate-50"
                                : "bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed"
                                }`}
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
