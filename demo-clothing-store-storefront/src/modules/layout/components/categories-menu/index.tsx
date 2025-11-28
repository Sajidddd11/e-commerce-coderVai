"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getCategoryIcon } from "../category-icons"

interface CategoriesMenuProps {
  categories: HttpTypes.StoreProductCategory[]
}

export default function CategoriesMenu({ categories }: CategoriesMenuProps) {
  // Filter top-level categories only
  const topLevelCategories = categories.filter((cat) => !cat.parent_category)

  return (
    <div className="w-full flex justify-center">
      <div className="flex items-center gap-3 small:gap-6 overflow-x-auto scrollbar-hide px-4">
        {topLevelCategories.length > 0 ? (
          topLevelCategories.map((category) => {
            const IconComponent = getCategoryIcon(category.name)

            return (
              <LocalizedClientLink
                key={category.id}
                href={`/categories/${category.handle}`}
                className="flex items-center gap-2 small:gap-2.5 px-1 py-2 text-grey-70 hover:text-grey-90 transition-colors group whitespace-nowrap flex-shrink-0 text-xs small:text-sm"
                title={category.name}
              >
                <div className="w-5 h-5 small:w-6 small:h-6 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <IconComponent size={24} />
                </div>
                <span className="hidden small:inline text-xs small:text-sm font-medium">{category.name}</span>
              </LocalizedClientLink>
            )
          })
        ) : (
          <div className="px-4 py-3 text-grey-60 text-sm">
            No categories available
          </div>
        )}
      </div>
    </div>
  )
}