import { listCategories, filterCategoriesWithProducts } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const allCategories = await listCategories()
  const productCategories = filterCategoriesWithProducts(allCategories)

  return (
    <footer className="w-full bg-black text-grey-0 border-t border-grey-80">
      <div className="content-container py-16">
        <div className="grid grid-cols-2 small:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 small:col-span-1">
            <LocalizedClientLink
              href="/"
              className="font-bold text-xl text-grey-0 hover:text-grey-40 transition-colors block mb-4"
            >
              ZAHAN Fashion and Lifestyle
            </LocalizedClientLink>
            <p className="text-grey-50 text-sm leading-relaxed">
              Discover our curated collection of premium clothing and accessories. Quality, style, and elegance in every piece.
            </p>
          </div>

          {/* Categories */}
          {productCategories && productCategories.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-4">Categories</h3>
              <ul className="space-y-2" data-testid="footer-categories">
                {productCategories
                  .filter((c) => !c.parent_category)
                  .slice(0, 5)
                  .map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                      href={`/categories/${c.handle}`}
                      className="text-grey-50 hover:text-grey-0 transition-colors text-sm"
                      data-testid="category-link"
                    >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Collections */}
          {collections && collections.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-4">Collections</h3>
              <ul className="space-y-2">
                {collections.slice(0, 5).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      href={`/collections/${c.handle}`}
                      className="text-grey-50 hover:text-grey-0 transition-colors text-sm"
                    >
                      {c.title}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Support & Info */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <LocalizedClientLink
                  href="/account"
                  className="text-grey-50 hover:text-grey-0 transition-colors text-sm"
                >
                  My Account
                </LocalizedClientLink>
              </li>
              <li>
                <a
                  href="mailto:support@zahan.com"
                  className="text-grey-50 hover:text-grey-0 transition-colors text-sm"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-grey-50 hover:text-grey-0 transition-colors text-sm"
                >
                  Shipping Info
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-grey-50 hover:text-grey-0 transition-colors text-sm"
                >
                  Returns
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-grey-80 pt-8 flex flex-col gap-6 small:gap-4">
          {/* Payment methods strip */}
          <div className="flex justify-center">
            <Image
              src="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-01.png"
              alt="Accepted payment methods via SSLCommerz"
              width={1200}
              height={150}
              className="w-full max-w-5xl h-auto object-contain"
            />
          </div>

          <div className="flex flex-col small:flex-row small:items-center small:justify-between gap-4">
            <p className="text-grey-50 text-sm">
              © {new Date().getFullYear()} ZAHAN Fashion and Lifestyle. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-grey-50 hover:text-grey-0 transition-colors text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-grey-50 hover:text-grey-0 transition-colors text-sm"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}