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
      <div className="flex items-center gap-1 w-fit px-5 overflow-x-auto scrollbar-hide">
        {topLevelCategories.length > 0 ? (
          topLevelCategories.map((category) => {
            const IconComponent = getCategoryIcon(category.name)
            const isActive = isCategoryActive(category.handle)

            return (
              <LocalizedClientLink
                key={category.id}
                href={`/categories/${category.handle}`}
                className={`group flex items-center gap-1 small:gap-2 px-5 py-2 whitespace-nowrap flex-shrink-0 typography-nav-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 hover:font-bold rounded-lg ${isActive
                  ? "bg-black text-white shadow-md scale-105"
                  : "text-slate-900 hover:text-black hover:bg-grey-30"
                  }`}
                title={category.name}
              >
                <div className="flex-shrink-0 transition-all">
                  <IconComponent className="" size={28} />
                </div>
                <div className="hidden small:inline typography-nav text-lg">
                  {category.name}
                </div>
              </LocalizedClientLink>
            )
          })
        ) : (
          <div className="typography-body-sm px-4 py-3 text-grey-40">
            No categories available
          </div>
        )}
      </div>
      {/* Bulk Orders Special Link */}
      <LocalizedClientLink
        href="/bulk-order"
        className={`ml-2 flex items-center gap-1.5 px-4 py-1.5 whitespace-nowrap flex-shrink-0 typography-nav-sm font-semibold transition-all duration-300 rounded-lg border border-[#56aebf]/60 text-[#56aebf] hover:bg-[#56aebf]/10 hover:border-[#56aebf] ${pathname.includes("/bulk-order") ? "bg-[#56aebf]/10 border-[#56aebf]" : ""}`}
      >
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
        Bulk Orders
      </LocalizedClientLink>
    </div>
  )
}
