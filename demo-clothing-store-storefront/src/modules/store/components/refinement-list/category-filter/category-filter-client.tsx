"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"

interface CategoryFilterClientProps {
  categories: HttpTypes.StoreProductCategory[]
  dataTestId?: string
}

export default function CategoryFilterClient({
  categories,
  dataTestId,
}: CategoryFilterClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Only show a selected category when on the /store page with a ?category= param
  const isOnStorePage = pathname.includes("/store")
  const selectedCategoryId = isOnStorePage ? searchParams.get("category") : null

  // When navigating back to the store page without a category param, clear any stale selection
  const prevPathnameRef = useRef(pathname)
  useEffect(() => {
    // If we just landed on the store page from a non-store page, replace history to clear category
    if (
      pathname !== prevPathnameRef.current &&
      isOnStorePage &&
      !searchParams.get("category")
    ) {
      // Already clean URL — nothing to do
    }
    prevPathnameRef.current = pathname
  }, [pathname, isOnStorePage, searchParams])

  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      const params = new URLSearchParams()

      // If clicking the same category, deselect it
      if (selectedCategoryId === categoryId) {
        params.delete("category")
      } else {
        params.set("category", categoryId)
      }

      // Preserve sort if set
      const sortBy = searchParams.get("sortBy")
      if (sortBy) params.set("sortBy", sortBy)

      // Reset to page 1 when changing category
      params.set("page", "1")

      // Use replace so back button doesn't restore stale category filters
      router.replace(`/store?${params.toString()}`)
    },
    [selectedCategoryId, searchParams, router]
  )

  return (
    <div className="py-4 w-fit" data-testid={dataTestId || "category-filter"}>
      <h3 className="text-lg font-bold text-slate-900 mb-4">Categories</h3>

      {categories.length === 0 ? (
        <p className="text-sm font-medium text-slate-600">No categories available</p>
      ) : (
        <ul className="space-y-2">
          {/* All Products option to explicitly clear filter */}
          <li>
            <button
              onClick={() => router.replace("/store")}
              className={`w-fit px-2 text-left rounded text-base font-medium overflow-hidden transition-all duration-300 ease-in-out ${!selectedCategoryId
                  ? "bg-slate-900 text-white font-semibold"
                  : "text-slate-700 hover:bg-grey-10 hover:text-slate-900 hover:ml-2 hover:cursor-pointer"
                }`}
            >
              All Products
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => handleCategorySelect(category.id)}
                className={`w-fit px-2 text-left rounded text-base font-medium overflow-hidden text-md transition-all duration-300 ease-in-out ${selectedCategoryId === category.id
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-700 hover:bg-grey-10 hover:text-slate-900 hover:ml-2 hover:font-medium hover:cursor-pointer"
                  }`}
              >
                <div className="flex items-center justify-between gap-2 w-fit min-w-0">
                  <span className="">{category.name}</span>
                  {category.products && (
                    <span className={`text-sm font-medium whitespace-nowrap flex-shrink-0 ${selectedCategoryId === category.id
                        ? "text-grey-20"
                        : "text-slate-500"
                      }`}>
                      ({category.products.length})
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
