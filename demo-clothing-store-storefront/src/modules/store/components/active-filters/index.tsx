"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

interface ActiveFiltersProps {
  categories: HttpTypes.StoreProductCategory[]
}

export default function ActiveFilters({ categories }: ActiveFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeCategories = searchParams.get("category")
    ? searchParams.get("category")!.split(",").filter(Boolean)
    : []

  const priceMin = searchParams.get("priceMin")
  const priceMax = searchParams.get("priceMax")
  const sortBy = searchParams.get("sortBy")

  const hasFilters = activeCategories.length > 0 || priceMin || priceMax || sortBy

  if (!hasFilters) return null

  const removeFilter = (key: string, valueToRemove?: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (key === "category" && valueToRemove) {
      const filtered = activeCategories.filter((id) => id !== valueToRemove)
      if (filtered.length > 0) {
        params.set("category", filtered.join(","))
      } else {
        params.delete("category")
      }
    } else {
      params.delete(key)
    }

    params.set("page", "1")
    router.replace(`${pathname}?${params.toString()}`)
  }

  const clearAll = () => {
    router.replace(pathname)
  }

  // Get active category objects
  const activeCategoryObjects = categories.filter((cat) => activeCategories.includes(cat.id))

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-slate-50 rounded-xl border border-grey-20">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Active Filters:</span>
      
      {/* Category Chips */}
      {activeCategoryObjects.map((cat) => (
        <span
          key={cat.id}
          className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 bg-white border border-grey-20 rounded-full text-xs font-medium text-slate-800 shadow-sm"
        >
          <span>Category: {cat.name}</span>
          <button
            onClick={() => removeFilter("category", cat.id)}
            className="w-4 h-4 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </span>
      ))}

      {/* Price Chip */}
      {(priceMin || priceMax) && (
        <span className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 bg-white border border-grey-20 rounded-full text-xs font-medium text-slate-800 shadow-sm">
          <span>
            Price: {priceMin ? `${priceMin} BDT` : "0 BDT"} — {priceMax ? `${priceMax} BDT` : "Any"}
          </span>
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString())
              params.delete("priceMin")
              params.delete("priceMax")
              router.replace(`${pathname}?${params.toString()}`)
            }}
            className="w-4 h-4 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </span>
      )}

      {/* Sort Chip */}
      {sortBy && sortBy !== "created_at" && (
        <span className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 bg-white border border-grey-20 rounded-full text-xs font-medium text-slate-800 shadow-sm">
          <span>
            Sort: {sortBy === "popularity" ? "Popularity" : sortBy === "price_asc" ? "Price Low-High" : "Price High-Low"}
          </span>
          <button
            onClick={() => removeFilter("sortBy")}
            className="w-4 h-4 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </span>
      )}

      <button
        onClick={clearAll}
        className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors px-3 py-1 ml-auto hover:underline"
      >
        Clear All
      </button>
    </div>
  )
}
