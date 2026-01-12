import { listCategories, filterCategoriesWithProducts } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { FacebookIcon, InstagramIcon, YouTubeIcon, TikTokIcon, WhatsAppIcon, MailIcon, PhoneIcon } from "@modules/common/icons/social-icons"
import Image from "next/image"

export default async function Footer() {
  const allCategories = await listCategories()
  const productCategories = filterCategoriesWithProducts(allCategories)

  return (
    <footer className="w-full bg-black text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Image
              src="/footerlogo.svg"
              alt="ZAHAN - Premium Lifestyle Brand"
              width={200}
              height={80}
              className="w-auto h-auto max-h-20 mb-4"
            />
            {/* App Store Badges */}
            <div className="mt-4">
              <Image
                src="/playstore.png"
                alt="Download on Google Play and App Store"
                width={300}
                height={120}
                className="w-full max-w-[250px] h-auto"
              />
            </div>
          </div>

          {/* Shop Section - Dynamic Categories */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Shop</h3>
            <ul className="space-y-2.5">
              {productCategories
                .filter((c) => !c.parent_category)
                .slice(0, 6)
                .map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      href={`/categories/${c.handle}`}
                      className="text-gray-400 text-sm hover:text-white hover:translate-x-2 transition-all duration-200 inline-block"
                    >
                      {c.name}
                    </LocalizedClientLink>
                  </li>
                ))}
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Company</h3>
            <ul className="space-y-2.5">
              <li>
                <LocalizedClientLink href="/about" className="text-gray-400 text-sm hover:text-white hover:translate-x-2 transition-all duration-200 inline-block">
                  About ZAHAN
                </LocalizedClientLink>
              </li>
              <li>
                <a href="mailto:partners@zahan.com.bd" className="text-gray-400 text-sm hover:text-white hover:translate-x-2 transition-all duration-200 inline-block">
                  Wholesale & Collaboration
                </a>
              </li>
              <li>
                <LocalizedClientLink href="/contact" className="text-gray-400 text-sm hover:text-white hover:translate-x-2 transition-all duration-200 inline-block">
                  Contact
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/privacy-policy" className="text-gray-400 text-sm hover:text-white hover:translate-x-2 transition-all duration-200 inline-block">
                  Privacy Policy
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/terms" className="text-gray-400 text-sm hover:text-white hover:translate-x-2 transition-all duration-200 inline-block">
                  Terms & Conditions
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Support</h3>

            {/* 24/7 Hotline */}
            <div className="mb-4">
              <p className="text-gray-500 text-xs mb-1">24/7 Support Hotline</p>
              <a href="tel:+8809677610610" className="text-white font-medium hover:text-gray-300 transition-colors flex items-center gap-2">
                <PhoneIcon size={16} />
                +8809677610610
              </a>
            </div>

            {/* Live Assistance */}
            <div className="mb-4">
              <p className="text-gray-500 text-xs mb-2">Live Assistance</p>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>AI Support Agent (Chat)</li>
                <li>WhatsApp Support</li>
              </ul>
            </div>

            {/* Email Support */}
            <div>
              <p className="text-gray-500 text-xs mb-2">Email Support</p>
              <div className="space-y-1">
                <a href="mailto:support@zahan.com.bd" className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-2">
                  <MailIcon size={16} />
                  support@zahan.com.bd
                </a>
                <a href="mailto:info@zahan.com.bd" className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-2">
                  <MailIcon size={16} />
                  info@zahan.com.bd
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media - Horizontal Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="text-white font-semibold text-base mb-6 text-center">Connect With Us</h3>
          <div className="flex flex-wrap justify-center items-center gap-6">
            <a
              href="https://instagram.com/zahan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <div className="p-2 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                <InstagramIcon size={20} />
              </div>
              <span className="text-sm font-medium">Instagram</span>
            </a>

            <a
              href="https://facebook.com/zahan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <div className="p-2 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                <FacebookIcon size={20} />
              </div>
              <span className="text-sm font-medium">Facebook</span>
            </a>

            <a
              href="https://youtube.com/@zahan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <div className="p-2 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                <YouTubeIcon size={20} />
              </div>
              <span className="text-sm font-medium">YouTube</span>
            </a>

            <a
              href="https://tiktok.com/@zahan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <div className="p-2 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                <TikTokIcon size={20} />
              </div>
              <span className="text-sm font-medium">TikTok</span>
            </a>

            <a
              href="https://wa.me/8809677610610"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <div className="p-2 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                <WhatsAppIcon size={20} />
              </div>
              <span className="text-sm font-medium">WhatsApp</span>
            </a>

            <a
              href="mailto:info@zahan.com.bd"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <div className="p-2 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                <MailIcon size={20} />
              </div>
              <span className="text-sm font-medium">Email</span>
            </a>
          </div>
        </div>

        {/* Secure Payment */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="text-center">
            <h4 className="text-white font-semibold text-sm mb-3">SECURE PAYMENT & TRUST</h4>
            <p className="text-gray-500 text-xs mb-3">🔒 SSL Secured Checkout</p>

            <div className="flex justify-center">
              <Image
                src="/footer payment.png"
                alt="Accepted Payment Methods - bKash, Nagad, Upay, Visa, MasterCard, American Express"
                width={600}
                height={80}
                className="w-full max-w-lg h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-gray-900 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} ZAHAN. All rights reserved.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="https://instagram.com/zahan" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <InstagramIcon size={20} />
              </a>
              <a href="https://facebook.com/zahan" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <FacebookIcon size={20} />
              </a>
              <a href="https://youtube.com/@zahan" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <YouTubeIcon size={20} />
              </a>
            </div>

            <div className="flex gap-4 text-sm">
              <LocalizedClientLink href="/privacy-policy" className="text-gray-500 hover:text-white transition-colors">
                Privacy Policy
              </LocalizedClientLink>
              <span className="text-gray-700">|</span>
              <LocalizedClientLink href="/terms" className="text-gray-500 hover:text-white transition-colors">
                Terms & Conditions
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
