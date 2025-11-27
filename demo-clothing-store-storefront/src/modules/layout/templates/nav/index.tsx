import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import NavDropdown from "@modules/layout/components/nav-dropdown"
import MobileMenu from "@modules/layout/components/mobile-menu"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const categories = await listCategories()

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-slate-200 shadow-sm">
        <nav className="content-container flex items-center justify-between w-full h-full text-sm">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <MobileMenu regions={regions} categories={categories} />
            <LocalizedClientLink
              href="/"
              className="font-bold text-xl tracking-tight hover:text-slate-600 transition-colors"
              data-testid="nav-store-link"
            >
              ZAHAN
            </LocalizedClientLink>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden small:flex items-center gap-8">
            <NavDropdown categories={categories} />
            <LocalizedClientLink
              href="/store"
              className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              All Products
            </LocalizedClientLink>
          </div>

          {/* Right side - Account and Cart */}
          <div className="flex items-center gap-4 small:gap-6">
            <LocalizedClientLink
              className="hidden small:block text-slate-700 hover:text-slate-900 font-medium transition-colors"
              href="/account"
              data-testid="nav-account-link"
            >
              Account
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
