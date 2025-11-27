import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="w-full bg-slate-900 text-slate-100 border-t border-slate-800">
      <div className="content-container py-16">
        <div className="grid grid-cols-2 small:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 small:col-span-1">
            <LocalizedClientLink
              href="/"
              className="font-bold text-xl text-white hover:text-slate-300 transition-colors block mb-4"
            >
              ZAHAN Fashion and Lifestyle
            </LocalizedClientLink>
            <p className="text-slate-400 text-sm leading-relaxed">
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
                        className="text-slate-400 hover:text-white transition-colors text-sm"
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
                      className="text-slate-400 hover:text-white transition-colors text-sm"
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
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  My Account
                </LocalizedClientLink>
              </li>
              <li>
                <a
                  href="mailto:support@zahan.com"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Shipping Info
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Returns
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col small:flex-row small:items-center small:justify-between gap-4">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} ZAHAN Fashion and Lifestyle. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
