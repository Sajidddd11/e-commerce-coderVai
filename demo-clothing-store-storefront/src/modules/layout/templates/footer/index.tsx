import { listCategories, filterCategoriesWithProducts } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { FacebookIcon, InstagramIcon, YouTubeIcon, MailIcon, PhoneIcon, LockIcon, SmileIcon, ElectricTruckIcon } from "@modules/common/icons/social-icons"
import { socialMediaLinks } from "@lib/constants"
import Image from "next/image"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const allCategories = await listCategories()
  const productCategories = filterCategoriesWithProducts(allCategories)

  return (
    <footer className="w-full bg-[#58595B] text-grey-0">
      <div className="pt-10 pb-10 bg-[#F3F3F3]">
        {/* Bottom Bar */}
        <div className=" grid grid-cols-1 px-2 xsmall:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Payment methods strip */}
          <div className="flex w-full  flex-col gap-2">
            <span className=" w-fit mx-auto "><LockIcon size={32} color="#373A3C" /></span>
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
            <span className=" w-fit mx-auto"><SmileIcon size={32} color="#373A3C" /></span>
            <h1 className="text-[#373A3C] pt-2 text-xl mb-2 w-fit mx-auto font-semibold">Satisfaction guaranteed</h1>

            <p className="text-[#373A3C] text-lg w-fit mx-auto font-medium">Made with premium quality materials.</p>
            <p className="text-[#373A3C] text-lg w-fit mx-auto font-semibold">Cozy yet lasts the test of time</p>
          </div>
          {/* Worldwide delivery */}
          <div className="flex w-full flex-col gap-2">
            <span className=" w-fit mx-auto"><ElectricTruckIcon size={32} color="#373A3C" /></span>
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
      <div className="py-10 bg-[#37383F]">
        <div className="w-fit xsmall:w-full gap-5 mx-auto flex flex-col xsmall:flex-row xsmall:max-w-5xl xsmall:mx-auto justify-between">

          <div className="flex flex-col w-fit">
            <div className="flex gap-2 items-center">
              <div>
                <MailIcon size={28} color="#F7941E" />
              </div>
              <div><h1 className="text-md xsmall:text-xl text-[#EBEBEB] font-semibold">GET SPECIAL DISCOUNTS IN YOUR INBOX</h1></div>
            </div>
            <div>
              <div className="flex gap-3 items-center py-3">
                <LocalizedClientLink
                  href={socialMediaLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#F7941E] rounded-full hover:bg-[#F7941E]/80 transition-colors duration-300 transform hover:scale-110"
                  aria-label="Visit our Facebook page"
                >
                  <FacebookIcon size={20} color="white" />
                </LocalizedClientLink>
                <LocalizedClientLink
                  href={socialMediaLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#F7941E] rounded-full hover:bg-[#F7941E]/80 transition-colors duration-300 transform hover:scale-110"
                  aria-label="Visit our Instagram page"
                >
                  <InstagramIcon size={20} color="white" />
                </LocalizedClientLink>
                <LocalizedClientLink
                  href={socialMediaLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#F7941E] rounded-full hover:bg-[#F7941E]/80 transition-colors duration-300 transform hover:scale-110"
                  aria-label="Visit our YouTube channel"
                >
                  <YouTubeIcon size={20} color="white" />
                </LocalizedClientLink>
              </div>
            </div>
          </div>
          <div className="flex gap-2  w-fit">
            <div><PhoneIcon size={20} color="#F7941E" /></div>
            <div>
              <p className="text-md xsmall:text-xl text-[#EBEBEB] font-semibold">FOR ANY HELP YOU MAY CALL US AT</p>
              <p className="text-xl text-[#AAAAAA]">+8809677666888</p>
              <p className="text-xl text-[#AAAAAA]">Open 24 Hours a Day, 7 Days a week</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl py-5 px-5 xsmall:py-16 mx-auto w-fit xsmall:w-full">
        <div className="grid grid-cols-2 small:grid-cols-5 gap-3 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <LocalizedClientLink
              href="/"
              className="font-medium text-xl text-[#F7941E] block mb-2 xsmall:mb-4"
            >
              ZAHAN Fashion and Lifestyle
            </LocalizedClientLink>
            <p className="text-[#EBEBEB] text-lg xsmall:text-xl font-light leading-relaxed">
              Discover our curated collection of premium clothing and accessories. Quality, style, and elegance in every piece.
            </p>
          </div>

          {/* Categories */}
          {productCategories && productCategories.length > 0 && (
            <div className="">
              <h3 className="font-medium text-lg xsmall:text-xl text-white mb-4">Categories</h3>
              <ul className="space-y-2" data-testid="footer-categories">
                {productCategories
                  .filter((c) => !c.parent_category)
                  .slice(0, 5)
                  .map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        href={`/categories/${c.handle}`}
                        className="text-[#EBEBEB] text-lg xsmall:text-xl transition-all duration-300 ease-in-out hover:text-[#F7941E] hover:pl-3"
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
              <h3 className="font-medium text-lg xsmall:text-xl text-white mb-4">Collections</h3>
              <ul className="space-y-2">
                {collections.slice(0, 5).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      href={`/collections/${c.handle}`}
                      className="text-[#EBEBEB] text-lg xsmall:text-xl transition-all duration-300 ease-in-out hover:text-[#F7941E] hover:pl-3"
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
            <h3 className="font-medium text-lg xsmall:text-xl text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <LocalizedClientLink
                  href="/account"
                  className="text-[#EBEBEB] text-lg xsmall:text-xl transition-all duration-300 ease-in-out hover:text-[#F7941E] hover:pl-3"
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
                  className="text-[#EBEBEB] text-xl transition-all duration-300 ease-in-out hover:text-[#F7941E] hover:pl-3"
                >
                  Privacy Policy
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/terms-of-service"
                  className="text-[#EBEBEB] text-xl transition-all duration-300 ease-in-out hover:text-[#F7941E] hover:pl-3"
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
