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
    <footer className="w-full bg-[#58595B] text-grey-0 border-t border-grey-80">
      <div className="content-container max-w-6xl py-16">
        <div className="grid grid-cols-2 small:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <LocalizedClientLink
              href="/"
              className="font-medium text-xl text-[#F7941E]  block mb-4"
            >
              ZAHAN Fashion and Lifestyle
            </LocalizedClientLink>
            <p className="text-[#EBEBEB] text-xl font-light leading-relaxed">
              Discover our curated collection of premium clothing and accessories. Quality, style, and elegance in every piece.
            </p>
            <div className="flex gap-3 items-center py-3">
              <div className=" p-2 bg-[#F7941E]/70 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-facebook-icon lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></div>
              <div className=" p-2 bg-[#F7941E]/70 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram-icon lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg></div>
              <div className=" p-2 bg-[#F7941E]/70 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-youtube-icon lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg></div>
            </div>
          </div>

          {/* Categories */}
          {productCategories && productCategories.length > 0 && (
            <div className="">
              <h3 className="font-medium text-xl text-white mb-4">Categories</h3>
              <ul className="space-y-2" data-testid="footer-categories">
                {productCategories
                  .filter((c) => !c.parent_category)
                  .slice(0, 5)
                  .map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        href={`/categories/${c.handle}`}
                        className="text-[#EBEBEB] text-xl transition-all duration-300 ease-in-out hover:text-[#F7941E] hover:pl-3"
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
            <div className="">
              <h3 className="font-medium text-xl text-white mb-4">Collections</h3>
              <ul className="space-y-2">
                {collections.slice(0, 5).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      href={`/collections/${c.handle}`}
                      className="text-[#EBEBEB] text-xl transition-all duration-300 ease-in-out hover:text-[#F7941E] hover:pl-3"
                    >
                      {c.title}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Support & Info */}
          <div className="">
            <h3 className="font-medium text-xl text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <LocalizedClientLink
                  href="/account"
                  className="text-[#EBEBEB] text-xl transition-all duration-300 ease-in-out hover:text-[#F7941E] hover:pl-3"
                >
                  My Account
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/contact"
                  className="text-[#EBEBEB] text-xl transition-all duration-300 ease-in-out hover:text-[#F7941E] hover:pl-3"
                >
                  Contact Us
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/shipping-info"
                  className="text-[#EBEBEB] text-xl transition-all duration-300 ease-in-out hover:text-[#F7941E] hover:pl-3"
                >
                  Shipping Info
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/returns"
                  className="text-[#EBEBEB] text-xl transition-all duration-300 ease-in-out hover:text-[#F7941E] hover:pl-3"
                >
                  Returns
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/privacy-policy"
                  className=" text-xl transition-all duration-300 ease-in-out hover:text-[#F7941E] hover:pl-3"
                >
                  Privacy Policy
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/terms-of-service"
                  className=" text-xl transition-all duration-300 ease-in-out hover:text-[#F7941E] hover:pl-3"
                >
                  Terms of Service
                </LocalizedClientLink>
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
        </div>
      </div>
      <div className=" bg-[#EBEBEB] py-10">
        <div className="flex text-black w-fit mx-auto flex-col small:flex-row small:items-center gap-4">
          <p className=" text-xl">
            © {new Date().getFullYear()} ZAHAN Fashion and Lifestyle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}