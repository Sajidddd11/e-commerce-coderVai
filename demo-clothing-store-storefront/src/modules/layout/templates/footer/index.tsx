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
      <div className="pt-14 pb-10 bg-[#F3F3F3]">
        {/* Bottom Bar */}
        <div className=" grid grid-cols-1 px-2 xsmall:grid-cols-3 gap-3 small:gap-8 max-w-6xl mx-auto">
          {/* Payment methods strip */}
          <div className="flex w-full  flex-col gap-2">
            <span className=" w-fit mx-auto "><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#373A3C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock-icon lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></span>
            <h1 className="text-[#373A3C] text-xl w-fit mx-auto font-semibold">All secure payment methods</h1>
            <Image
              src="/sslcommerz.png"
              alt="Accepted payment methods via SSLCommerz"
              width={600}
              height={75}
              className="w-full h-auto object-contain"
            />
          </div>
          {/* Satisfaction guaranteed */}
          <div className="flex w-full  flex-col">
            <span className=" w-fit mx-auto"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#373A3C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile-icon lucide-smile"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg></span>
            <h1 className="text-[#373A3C] pt-2 text-xl mb-2 w-fit mx-auto font-semibold">Satisfaction guaranteed</h1>

            <p className="text-[#373A3C] text-lg w-fit mx-auto font-medium">Made with premium quality materials.</p>
            <p className="text-[#373A3C] text-lg w-fit mx-auto font-semibold">Cozy yet lasts the test of time</p>
          </div>
          {/* Worldwide delivery */}
          <div className="flex w-full flex-col gap-2">
            <span className=" w-fit mx-auto"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#373A3C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck-electric-icon lucide-truck-electric"><path d="M14 19V7a2 2 0 0 0-2-2H9" /><path d="M15 19H9" /><path d="M19 19h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 9.38a1 1 0 0 0-.78-.38H14" /><path d="M2 13v5a1 1 0 0 0 1 1h2" /><path d="M4 3 2.15 5.15a.495.495 0 0 0 .35.86h2.15a.47.47 0 0 1 .35.86L3 9.02" /><circle cx="17" cy="19" r="2" /><circle cx="7" cy="19" r="2" /></svg></span>
            <h1 className="text-[#373A3C] text-xl w-fit mx-auto font-semibold">Worldwide delivery</h1>
            <Image
              src="/delivery.png"
              alt="Accepted payment methods via SSLCommerz"
              width={600}
              height={75}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
      <div className="py-10 pl-3 bg-[#37383F]">
        <div className=" grid grid-cols-1 xsmall:grid-cols-2 gap-3 xsmall:max-w-4xl xsmall:mx-auto">

          <div className="flex flex-col">
            <div className="flex gap-2 items-center">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F7941E" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail-icon lucide-mail"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg>
              </div>
              <div><h1 className="text-md xsmall:text-xl text-[#EBEBEB] font-semibold">GET SPECIAL DISCOUNTS IN YOUR INBOX</h1></div>
            </div>
            <div>
              <div className="flex gap-3 items-center py-3">
                <div className=" p-2 bg-[#F7941E]/70 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-facebook-icon lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></div>
                <div className=" p-2 bg-[#F7941E]/70 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram-icon lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg></div>
                <div className=" p-2 bg-[#F7941E]/70 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-youtube-icon lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg></div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#F7941E" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone-icon lucide-phone"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" /></svg></div>
            <div>
              <p className="text-md xsmall:text-xl text-[#EBEBEB] font-semibold">FOR ANY HELP YOU MAY CALL US AT</p>
              <p className="text-xl text-[#AAAAAA]">+8809677666888</p>
              <p className="text-xl text-[#AAAAAA]">Open 24 Hours a Day, 7 Days a week</p>
            </div>
          </div>
        </div>
      </div>
      <div className="content-container max-w-6xl py-16">
        <div className="grid grid-cols-2 small:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <LocalizedClientLink
              href="/"
              className="font-medium text-xl text-[#F7941E] block mb-4"
            >
              ZAHAN Fashion and Lifestyle
            </LocalizedClientLink>
            <p className="text-[#EBEBEB] text-xl font-light leading-relaxed">
              Discover our curated collection of premium clothing and accessories. Quality, style, and elegance in every piece.
            </p>
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


      </div>
      <div className=" bg-[#EBEBEB] py-1 xsmall:py-5">
        <div className="flex text-black w-fit mx-auto flex-col small:flex-row small:items-center gap-4">
          <p className="text-sm xsmall:text-xl">
            © {new Date().getFullYear()} ZAHAN Fashion and Lifestyle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}