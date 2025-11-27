"use client"

import { HttpTypes } from "@medusajs/types"
import { useEffect, useRef, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface MobileMenuProps {
  regions: HttpTypes.StoreRegion[]
  categories: HttpTypes.StoreProductCategory[]
}

export default function MobileMenu({
  regions,
  categories,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const topLevelCategories = categories.filter((cat) => !cat.parent_category)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.body.style.overflow = "unset"
      }
    }
  }, [isOpen])

  return (
    <div className="small:hidden" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-700 hover:text-slate-900 transition-colors"
        aria-label="Menu"
      >
        <svg
          className={`w-6 h-6 transition-transform ${isOpen ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 top-16"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl z-50 max-h-[calc(100vh-64px)] overflow-y-auto">
            <div className="p-4 space-y-2">
              <LocalizedClientLink
                href="/store"
                className="block px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                All Products
              </LocalizedClientLink>

              <div className="border-t border-slate-100 pt-2">
                <h3 className="px-4 py-2 text-sm font-semibold text-slate-900">
                  Categories
                </h3>
                {topLevelCategories.map((category) => (
                  <LocalizedClientLink
                    key={category.id}
                    href={`/categories/${category.handle}`}
                    className="block px-6 py-2 text-slate-700 hover:bg-slate-50 text-sm transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {category.name}
                  </LocalizedClientLink>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-2">
                <LocalizedClientLink
                  href="/account"
                  className="block px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  My Account
                </LocalizedClientLink>
              </div>

              {regions && regions.length > 1 && (
                <div className="border-t border-slate-100 pt-2">
                  <h3 className="px-4 py-2 text-sm font-semibold text-slate-900">
                    Region
                  </h3>
                  {regions.map((region) => (
                    <div
                      key={region.id}
                      className="px-4 py-2 text-slate-700 text-sm"
                    >
                      {region.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
