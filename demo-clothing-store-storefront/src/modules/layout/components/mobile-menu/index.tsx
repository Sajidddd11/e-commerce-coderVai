"use client"

import { HttpTypes } from "@medusajs/types"
import { useEffect, useRef, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"

interface MobileMenuProps {
  regions: HttpTypes.StoreRegion[]
  categories: HttpTypes.StoreProductCategory[]
}

export default function MobileMenu({
  regions,
  categories,
}: MobileMenuProps) {
  const pathname = usePathname()
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
  // Check if a category is active based on current path
  const isCategoryActive = (categoryHandle: string): boolean => {
    return pathname.includes(`/categories/${categoryHandle}`)
  }
  return (
    <div className="small:hidden" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-700 hover:text-slate-900 transition-colors duration-300"
        aria-label="Menu"
      >
        <svg
          className={`w-6 h-6 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? "rotate-90" : ""}`}
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
      <>
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 top-16 transition-opacity duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Menu */}
        <div className={`absolute top-full left-0 right-0 bg-white border-b border-slate-200 z-50 max-h-[calc(100vh-64px)] overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform ${isOpen ? "translate-x-0 opacity-100 shadow-2xl" : "-translate-x-full opacity-0 pointer-events-none shadow-none"}`}>
          <div className="px-4 py-2 space-y-1">
            <LocalizedClientLink
              href="/store"
              className={`block px-4 py-2 text-slate-800 hover:bg-slate-50 rounded-lg font-medium transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] font-['Ubuntu'] text-base ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
              style={{
                transitionDelay: isOpen ? "50ms" : "0ms",
              }}
              onClick={() => setIsOpen(false)}
            >
              All Products
            </LocalizedClientLink>
            

            <div className=" border-slate-100">
              <LocalizedClientLink
                href="/account"
                className={`block px-4 py-2 text-slate-800 hover:bg-slate-50 rounded-lg font-medium transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] font-['Ubuntu'] text-base ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                style={{
                  transitionDelay: isOpen ? `${400 + topLevelCategories.length * 25}ms` : "0ms",
                }}
                onClick={() => setIsOpen(false)}
              >
                My Account
              </LocalizedClientLink>
            </div>

            <div className="border-t border-slate-100">
              <h3 className={`px-4 py-1 text-base font-semibold text-slate-900 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] font-['Ubuntu'] ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                style={{
                  transitionDelay: isOpen ? "100ms" : "0ms",
                }}
              >
                Categories
              </h3>
              {topLevelCategories.map((category, index) => {
                const isActive = isCategoryActive(category.handle)
                return (
                  <LocalizedClientLink
                    key={category.id}
                    href={`/categories/${category.handle}`}
                    className={`block px-6 py-1 text-slate-800 hover:bg-slate-50 text-base transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] font-['Ubuntu'] ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                    style={{
                      transitionDelay: isOpen ? `${150 + index * 25}ms` : "0ms",
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className={`relative z-10 ${isActive
                      ? "bg-black border text-white px-2 py-1 rounded-sm"
                      : ""
                      }`}>
                      {category.name}
                    </span>
                    
                  </LocalizedClientLink>
                )
              })}
            </div>

            {regions && regions.length > 1 && (
              <div className="border-t border-slate-100">
                <h3 className={`px-4 py-2 text-base font-semibold text-slate-900 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] font-['Ubuntu'] ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                  style={{
                    transitionDelay: isOpen ? `${450 + topLevelCategories.length * 25}ms` : "0ms",
                  }}
                >
                  Region
                </h3>
                {regions.map((region, index) => (
                  <div
                    key={region.id}
                    className={`px-4 py-2 text-slate-800 text-base transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] font-['Ubuntu'] ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                    style={{
                      transitionDelay: isOpen ? `${500 + topLevelCategories.length * 25 + index * 25}ms` : "0ms",
                    }}
                  >
                    {region.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    </div>
  )
}
