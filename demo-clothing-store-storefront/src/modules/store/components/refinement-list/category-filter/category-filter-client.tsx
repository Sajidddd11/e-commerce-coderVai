"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
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

  const selectedCategoryId = searchParams.get("category")

  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      const params = new URLSearchParams(searchParams)

      // If clicking the same category, deselect it
      if (selectedCategoryId === categoryId) {
        params.delete("category")
      } else {
        params.set("category", categoryId)
      }

      // Reset to page 1 when changing category
      params.set("page", "1")

      router.push(`/store?${params.toString()}`)
    },
    [selectedCategoryId, searchParams, pathname, router]
  )

  return (
    <div className="py-4 w-fit" data-testid={dataTestId || "category-filter"}>
      <h3 className="text-lg font-bold text-slate-900 mb-4 font-['Ubuntu']">Categories</h3>

      {categories.length === 0 ? (
        <p className="text-sm font-medium text-slate-600 font-['Ubuntu']">No categories available</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => handleCategorySelect(category.id)}
                className={`w-fit px-2 text-left rounded text-base font-medium transition-colors overflow-hidden font-['Ubuntu'] ${selectedCategoryId === category.id
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-700 hover:bg-grey-10 hover:text-slate-900"
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
