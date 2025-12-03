"use client"

import { HttpTypes } from "@medusajs/types"
import { usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getCategoryIcon } from "../category-icons"

interface CategoriesMenuProps {
  categories: HttpTypes.StoreProductCategory[]
}

export default function CategoriesMenu({ categories }: CategoriesMenuProps) {
  const pathname = usePathname()

  // Filter top-level categories only
  const topLevelCategories = categories.filter((cat) => !cat.parent_category)

  // Check if a category is active based on current path
  const isCategoryActive = (categoryHandle: string): boolean => {
    return pathname.includes(`/categories/${categoryHandle}`)
  }

  return (
    <div className="w-full flex items-center justify-center">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {topLevelCategories.length > 0 ? (
          topLevelCategories.map((category) => {
            const IconComponent = getCategoryIcon(category.name)
            const isActive = isCategoryActive(category.handle)

            return (
              <LocalizedClientLink
                key={category.id}
                href={`/categories/${category.handle}`}
                className={`flex items-center gap-1 small:gap-2 px-5 py-2 transition-all group whitespace-nowrap flex-shrink-0 text-xs small:text-sm font-medium ${isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-900 hover:bg-white hover:shadow-sm"
                  }`}
                title={category.name}
              >
                <div className={`flex-shrink-0 transition-all ${isActive
                  ? "text-slate-900"
                  : "text-slate-900 group-hover:scale-110"
                  }`}>
                  <IconComponent className="" size={16} />
                </div>
                <div className="hidden small:inline text-xs small:text-sm font-medium">
                  {category.name}
                </div>
              </LocalizedClientLink>
            )
          })
        ) : (
          <div className="px-4 py-3 text-grey-40 text-sm">
            No categories available
          </div>
        )}
      </div>
    </div>
  )
}
