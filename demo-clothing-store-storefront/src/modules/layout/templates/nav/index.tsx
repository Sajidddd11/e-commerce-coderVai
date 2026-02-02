import { Suspense } from "react"
import Image from "next/image"

import { listRegions } from "@lib/data/regions"
import { listCategories, filterCategoriesWithProducts } from "@lib/data/categories"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import MobileMenu from "@modules/layout/components/mobile-menu"
import CentralSearch from "@modules/layout/components/central-search"
import CategoriesMenu from "@modules/layout/components/categories-menu"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const allCategories = await listCategories()
  const categories = filterCategoriesWithProducts(allCategories)

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header className="bg-white border-b border-grey-20 shadow-sm">
        {/* Top Row: Logo, Search, Icons - Constrained Width */}
        <nav className="content-container">
          <div className="flex items-center justify-between h-16 gap-2 small:gap-4">
            {/* Left: Logo + Mobile Menu */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <MobileMenu regions={regions} categories={categories} />
              <LocalizedClientLink
                href="/"
                className="flex items-center hover:opacity-90 transition-opacity whitespace-nowrap"
                data-testid="nav-store-link"
              >
                <img
                  src="/finallogoblack.svg"
                  alt="ZAHAN"
                  width={224}
                  height={56}
                  className="h-auto w-36 small:w-56"
                />
              </LocalizedClientLink>
            </div>

            {/* Center: Search Bar - Hidden on very small screens, 50% width on tablet+ */}
            <div className="hidden xsmall:flex small:w-1/2 medium:w-1/2">
              <CentralSearch initialCategories={categories} />
            </div>

            {/* Right: Account (Desktop only) + Cart (Mobile + Desktop) */}
            <div className="flex items-center gap-2 small:gap-4 flex-shrink-0">
              <LocalizedClientLink
                className="typography-nav-sm hidden small:flex items-center gap-2 px-3 py-2 text-grey-70 hover:text-grey-90 hover:bg-grey-5 rounded-lg transition-colors"
                href="/account"
                data-testid="nav-account-link"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="hidden medium:inline">Account</span>
              </LocalizedClientLink>
              <div className="h-6 w-px bg-grey-20 hidden small:block" />
              <Suspense
                fallback={
                  <LocalizedClientLink
                    className="typography-nav-sm flex items-center gap-2 px-3 py-2 text-grey-70 hover:text-grey-90 hover:bg-grey-5 rounded-lg transition-colors"
                    href="/cart"
                    data-testid="nav-cart-link"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10-9l2 9m-9-9h14l-4 8H7l4-8z"
                      />
                    </svg>
                    <span className="hidden medium:inline">Cart</span>
                  </LocalizedClientLink>
                }
              >
                <CartButton />
              </Suspense>
            </div>
          </div>

          {/* Mobile Search Bar - Shown on very small screens */}
          <div className="xsmall:hidden border-t border-grey-20 px-0 py-3">
            <CentralSearch initialCategories={categories} />
          </div>
        </nav>

        {/* Desktop Navigation Links - Second Row with Categories - Full Width Background */}
        <div className="hidden small:flex items-center border-t border-grey-10 h-12 overflow-x-auto w-full" style={{ backgroundColor: '#F1F5F9' }}>
          <div className="content-container w-full">
            <CategoriesMenu categories={categories} />
          </div>
        </div>
      </header>
    </div>
  )
}
