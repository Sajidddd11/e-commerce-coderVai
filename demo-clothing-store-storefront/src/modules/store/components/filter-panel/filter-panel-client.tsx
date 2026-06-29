"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"

interface FilterPanelClientProps {
  categories: HttpTypes.StoreProductCategory[]
}

const sortOptions = [
  { value: "best_selling", label: "Best Selling" },
  { value: "created_at", label: "Latest Arrivals" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
]

export default function FilterPanelClient({ categories }: FilterPanelClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeSort = searchParams.get("sortBy") || "created_at"
  const activeCategories = searchParams.get("category")
    ? searchParams.get("category")!.split(",").filter(Boolean)
    : []
  
  // Local state for price inputs
  const [minPriceInput, setMinPriceInput] = useState(searchParams.get("priceMin") || "")
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get("priceMax") || "")

  // Sync state with URL search params changes
  useEffect(() => {
    setMinPriceInput(searchParams.get("priceMin") || "")
    setMaxPriceInput(searchParams.get("priceMax") || "")
  }, [searchParams])

  // Update query params helper
  const updateQuery = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    // Reset page to 1 on any filter change
    params.set("page", "1")
    
    router.replace(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

  // Category Selection
  const handleCategoryToggle = (categoryId: string) => {
    let newCategories: string[]
    if (activeCategories.includes(categoryId)) {
      newCategories = activeCategories.filter((id) => id !== categoryId)
    } else {
      newCategories = [...activeCategories, categoryId]
    }
    updateQuery({ category: newCategories.length > 0 ? newCategories.join(",") : null })
  }

  // Clear all filters
  const handleClearAll = () => {
    setMinPriceInput("")
    setMaxPriceInput("")
    router.replace(pathname)
  }

  // Price submit
  const handlePriceApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    updateQuery({
      priceMin: minPriceInput || null,
      priceMax: maxPriceInput || null,
    })
  }

  return (
    <div className="flex flex-col gap-7 divide-y divide-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Filters</h2>
        {(activeCategories.length > 0 || minPriceInput || maxPriceInput || searchParams.get("sortBy")) && (
          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-slate-500 hover:text-slate-950 transition-colors uppercase tracking-wider hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Sort Section */}
      <div className="flex flex-col gap-3 pt-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort By</h3>
        <div className="flex flex-col gap-1.5">
          {sortOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 py-1 text-sm text-slate-600 hover:text-slate-900 cursor-pointer group transition-colors"
            >
              <input
                type="radio"
                name="sortBy"
                value={option.value}
                checked={activeSort === option.value}
                onChange={() => updateQuery({ sortBy: option.value })}
                className="w-4.5 h-4.5 rounded-full border-slate-200 text-black accent-black focus:ring-black cursor-pointer transition-all"
              />
              <span className={activeSort === option.value ? "font-semibold text-slate-900" : ""}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="flex flex-col gap-3 pt-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Categories</h3>
        {categories.length === 0 ? (
          <p className="text-sm text-slate-400">No categories found</p>
        ) : (
          <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1">
            {categories.map((category) => {
              const isChecked = activeCategories.includes(category.id)
              return (
                <label
                  key={category.id}
                  className="flex items-center justify-between py-1.5 text-sm text-slate-600 hover:text-slate-900 group cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="w-4.5 h-4.5 rounded border-slate-200 text-black accent-black focus:ring-black cursor-pointer transition-all"
                    />
                    <span className={isChecked ? "font-semibold text-slate-900" : ""}>
                      {category.name}
                    </span>
                  </div>
                  {category.products && (
                    <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                      ({category.products.length})
                    </span>
                  )}
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Price Range Section */}
      <div className="flex flex-col gap-3 pt-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price Range (BDT)</h3>
        <form onSubmit={handlePriceApply} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">Min</span>
              <input
                type="number"
                placeholder="0"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-full pl-10 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:ring-0 text-slate-800"
              />
            </div>
            <span className="text-slate-300 text-sm font-medium">—</span>
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">Max</span>
              <input
                type="number"
                placeholder="Any"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-full pl-10 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:ring-0 text-slate-800"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm uppercase tracking-wider"
          >
            Apply Price
          </button>
        </form>
      </div>
    </div>
  )
}
