import { listCategories, filterCategoriesWithProducts } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { FacebookIcon, InstagramIcon, YouTubeIcon, TikTokIcon, WhatsAppIcon, MailIcon, PhoneIcon } from "@modules/common/icons/social-icons"
import TrustBadges from "@modules/layout/components/trust-badges"
import Image from "next/image"

export default async function Footer() {
  const allCategories = await listCategories()
  const productCategories = filterCategoriesWithProducts(allCategories)

  return (
    <footer className="w-full bg-black text-white">
      {/* Trust Badges - Top Row */}
      <TrustBadges />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-16 pb-6 md:pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">

          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start gap-4">
              {/* Company Logo */}
              <Image
                src="/footerlogo.svg"
                alt="ZAHAN - Premium Lifestyle Brand"
                width={200}
                height={80}
                className="w-auto h-12 md:h-20 order-2 md:order-1"
              />
              {/* App Store Badges */}
              <Image
                src="/playstore.png"
                alt="Download on Google Play and App Store"
                width={300}
                height={120}
                className="w-auto max-w-[120px] md:max-w-[250px] h-auto order-1 md:order-2"
              />
            </div>
          </div>

          {/* Navigation Links - Shop Section */}
          <div className="text-center md:text-left">
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

          {/* Company Links */}
          <div className="text-center md:text-left">
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

          {/* Support Links */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold text-base mb-4">Support</h3>

            {/* 24/7 Hotline */}
            <div className="mb-4">
              <p className="text-gray-500 text-xs mb-1">24/7 Support Hotline</p>
              <a href="tel:+8809677610610" className="text-white font-medium hover:text-gray-300 transition-colors flex items-center gap-2 justify-center md:justify-start">
                <PhoneIcon size={16} />
                +8809677610610
              </a>
            </div>

            {/* WhatsApp Chat Support */}
            <div className="mb-4">
              <p className="text-gray-500 text-xs mb-2">Live Chat Support</p>
              <a
                href="https://wa.me/8809677610610?text=Hello%2C%20I%20need%20support"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 text-sm hover:text-green-300 transition-colors flex items-center gap-2 justify-center md:justify-start"
              >
                <WhatsAppIcon size={16} />
                Chat on WhatsApp
              </a>
            </div>

            {/* Email Support */}
            <div>
              <p className="text-gray-500 text-xs mb-2">Email Support</p>
              <div className="space-y-1">
                <a href="mailto:support@zahan.com.bd" className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-2 justify-center md:justify-start">
                  <MailIcon size={16} />
                  support@zahan.com.bd
                </a>
                <a href="mailto:info@zahan.com.bd" className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-2 justify-center md:justify-start">
                  <MailIcon size={16} />
                  info@zahan.com.bd
                </a>
              </div>
            </div>
          </div>

          {/* Connect / Contact Section */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold text-base mb-4">Connect With Us</h3>
            <div className="flex flex-row md:flex-col gap-2 md:gap-3 justify-center md:justify-start">
              <a
                href="https://facebook.com/zahan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="p-2 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                  <FacebookIcon size={16} />
                </div>
                <span className="text-sm hidden md:inline">Facebook</span>
              </a>

              <a
                href="https://youtube.com/@zahan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="p-2 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                  <YouTubeIcon size={16} />
                </div>
                <span className="text-sm hidden md:inline">YouTube</span>
              </a>

              <a
                href="https://tiktok.com/@zahan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="p-2 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                  <TikTokIcon size={16} />
                </div>
                <span className="text-sm hidden md:inline">TikTok</span>
              </a>

              <a
                href="https://instagram.com/zahan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
              >
                <div className="p-2 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                  <InstagramIcon size={16} />
                </div>
                <span className="text-sm hidden md:inline">Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Payment Methods - Separate Row */}
        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-800">
          <div className="text-center">
            <h4 className="text-white font-semibold text-xs md:text-sm mb-2 md:mb-3">SECURE PAYMENT & TRUST</h4>
            <p className="text-gray-500 text-xs mb-2 md:mb-3">We Accept All Major Payment Methods</p>

            <div className="flex justify-center">
              <Image
                src="/sslfinal.svg"
                alt="SSLCommerz Verified - Accepted Payment Methods: Visa, MasterCard, American Express, bKash, Nagad, Upay, Rocket, and more"
                width={600}
                height={120}
                className="w-full max-w-xs md:max-w-2xl h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-gray-900 bg-black">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
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
