import { listCategories, filterCategoriesWithProducts } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { FacebookIcon, InstagramIcon, YouTubeIcon, TikTokIcon, WhatsAppIcon, MailIcon, PhoneIcon } from "@modules/common/icons/social-icons"
import { Shield, Truck, RotateCcw, Lock, MapPin, Headphones } from "lucide-react"
import Image from "next/image"

interface TrustBadgeProps {
  icon: React.ReactNode
  label: string
}

const TrustBadge = ({ icon, label }: TrustBadgeProps) => (
  <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-lg hover:shadow-xl hover:border-teal-500/30 transition-all duration-300">
    <div className="text-teal-400">
      {icon}
    </div>
    <span className="text-xs text-slate-300 text-center font-medium">{label}</span>
  </div>
)

export default async function Footer() {
  const allCategories = await listCategories()
  const productCategories = filterCategoriesWithProducts(allCategories)

  const shopCategories = productCategories
    .filter((c) => !c.parent_category)
    .slice(0, 8)

  return (
    <footer className="w-full bg-[#04080F] text-slate-100 overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-slate-900/20 pointer-events-none"></div>

      <div className="relative z-10">
        {/* Trust Badges Section */}
        <div className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              <TrustBadge
                icon={<Shield size={24} />}
                label="Payment Security"
              />
              <TrustBadge
                icon={<Truck size={24} />}
                label="Fast Delivery"
              />
              <TrustBadge
                icon={<RotateCcw size={24} />}
                label="Easy Returns"
              />
              <TrustBadge
                icon={<Lock size={24} />}
                label="Secure Checkout"
              />
              <TrustBadge
                icon={<MapPin size={24} />}
                label="Multiple Locations"
              />
              <TrustBadge
                icon={<Headphones size={24} />}
                label="24/7 Hotline"
              />
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
          {/* Five Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10 mb-8 md:mb-12">

            {/* Column 1: Brand Card */}
            <div className="lg:col-span-1 flex flex-col">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-teal-500/30 transition-all duration-300 flex flex-col flex-grow">
                {/* Brand Logo */}
                <div className="mb-6">
                  <Image
                    src="/footerlogo.svg"
                    alt="ZAHAN - Premium Lifestyle Brand"
                    width={200}
                    height={80}
                    className="w-auto h-12 md:h-16 object-contain"
                  />
                </div>

                {/* Brand Description */}
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  Discover premium lifestyle products crafted with excellence and style.
                </p>

                {/* App Store Badges */}
                <div className="mb-6">
                  <p className="text-xs text-slate-500 font-semibold mb-3 uppercase tracking-wider">Download App</p>
                  <Image
                    src="/playstore.png"
                    alt="Download on Google Play and App Store"
                    width={300}
                    height={120}
                    className="w-full h-auto rounded-lg"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mb-6">
                  <button className="w-full px-4 py-3 bg-teal-500/10 border border-teal-500/50 rounded-lg text-teal-300 text-sm font-semibold hover:bg-teal-500/20 hover:border-teal-400 transition-all duration-300">
                    Track Order
                  </button>
                  <a
                    href="https://wa.me/8809677610610?text=Hello%2C%20I%20need%20help"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-300 text-sm font-semibold hover:bg-green-500/20 hover:border-green-400 transition-all duration-300 text-center"
                  >
                    WhatsApp Us
                  </a>
                </div>

                {/* Newsletter Section */}
                {/* <div className="mt-auto">
                  <p className="text-xs text-slate-500 font-semibold mb-3 uppercase tracking-wider">Newsletter</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-colors"
                    />
                    <button className="px-4 py-2 bg-teal-500 text-slate-950 font-semibold rounded-lg hover:bg-teal-400 transition-all duration-300 text-sm whitespace-nowrap">
                      Join
                    </button>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Column 2: Navigation - Shop/Categories */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-teal-500/30 transition-all duration-300">
              <h3 className="text-slate-100 font-semibold text-lg mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></span>
                Categories
              </h3>
              <ul className="space-y-3">
                {shopCategories.map((category) => (
                  <li key={category.id}>
                    <LocalizedClientLink
                      href={`/categories/${category.handle}`}
                      className="text-slate-400 text-sm hover:text-teal-400 hover:translate-x-1 transition-all duration-200 inline-block font-medium"
                    >
                      {category.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-teal-500/30 transition-all duration-300">
              <h3 className="text-slate-100 font-semibold text-lg mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></span>
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <LocalizedClientLink
                    href="/about"
                    className="text-slate-400 text-sm hover:text-teal-400 hover:translate-x-1 transition-all duration-200 inline-block font-medium"
                  >
                    About
                  </LocalizedClientLink>
                </li>
                <li>
                  <a
                    href="mailto:partners@zahan.com.bd"
                    className="text-slate-400 text-sm hover:text-teal-400 hover:translate-x-1 transition-all duration-200 inline-block font-medium"
                  >
                    Wholesale & Collaboration
                  </a>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/contact"
                    className="text-slate-400 text-sm hover:text-teal-400 hover:translate-x-1 transition-all duration-200 inline-block font-medium"
                  >
                    Contact
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/privacy-policy"
                    className="text-slate-400 text-sm hover:text-teal-400 hover:translate-x-1 transition-all duration-200 inline-block font-medium"
                  >
                    Privacy Policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/terms"
                    className="text-slate-400 text-sm hover:text-teal-400 hover:translate-x-1 transition-all duration-200 inline-block font-medium"
                  >
                    Terms & Conditions
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Column 4: Support */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-teal-500/30 transition-all duration-300">
              <h3 className="text-slate-100 font-semibold text-lg mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></span>
                Support
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="/payment-methods"
                    className="text-slate-400 text-sm hover:text-teal-400 hover:translate-x-1 transition-all duration-200 inline-block font-medium"
                  >
                    Payment
                  </a>
                </li>
                <li>
                  <a
                    href="/shipping-info"
                    className="text-slate-400 text-sm hover:text-teal-400 hover:translate-x-1 transition-all duration-200 inline-block font-medium"
                  >
                    Shipping
                  </a>
                </li>
                <li>
                  <a
                    href="/return-policy"
                    className="text-slate-400 text-sm hover:text-teal-400 hover:translate-x-1 transition-all duration-200 inline-block font-medium"
                  >
                    Return/Replace
                  </a>
                </li>
                <li>
                  <a
                    href="/track-order"
                    className="text-slate-400 text-sm hover:text-teal-400 hover:translate-x-1 transition-all duration-200 inline-block font-medium"
                  >
                    Track Order
                  </a>
                </li>
                <li>
                  <a
                    href="/help-center"
                    className="text-slate-400 text-sm hover:text-teal-400 hover:translate-x-1 transition-all duration-200 inline-block font-medium"
                  >
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 5: Connect */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-teal-500/30 transition-all duration-300">
              <h3 className="text-slate-100 font-semibold text-lg mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></span>
                Connect
              </h3>

              {/* Social Icons */}
              <div className="mb-8">
                <p className="text-xs text-slate-500 font-semibold mb-4 uppercase tracking-wider">Follow Us</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://instagram.com/zahan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:bg-teal-500/20 hover:border-teal-500/50 hover:text-teal-400 transition-all duration-300"
                  >
                    <InstagramIcon size={18} />
                  </a>
                  <a
                    href="https://facebook.com/zahan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:bg-teal-500/20 hover:border-teal-500/50 hover:text-teal-400 transition-all duration-300"
                  >
                    <FacebookIcon size={18} />
                  </a>
                  <a
                    href="https://youtube.com/@zahan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:bg-teal-500/20 hover:border-teal-500/50 hover:text-teal-400 transition-all duration-300"
                  >
                    <YouTubeIcon size={18} />
                  </a>
                  <a
                    href="https://tiktok.com/@zahan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:bg-teal-500/20 hover:border-teal-500/50 hover:text-teal-400 transition-all duration-300"
                  >
                    <TikTokIcon size={18} />
                  </a>
                  <a
                    href="https://wa.me/8809677610610"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-400 transition-all duration-300"
                  >
                    <WhatsAppIcon size={18} />
                  </a>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MailIcon size={18} className="text-teal-400 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col gap-1">
                    <a
                      href="mailto:support@zahan.com.bd"
                      className="text-xs text-slate-400 hover:text-teal-400 transition-colors"
                    >
                      support@zahan.com.bd
                    </a>
                    <a
                      href="mailto:info@zahan.com.bd"
                      className="text-xs text-slate-400 hover:text-teal-400 transition-colors"
                    >
                      info@zahan.com.bd
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PhoneIcon size={18} className="text-teal-400 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-slate-500">Hotline</p>
                    <a
                      href="tel:+8809677610610"
                      className="text-xs text-slate-300 hover:text-teal-400 transition-colors font-semibold"
                    >
                      +880 96 77 61 06 10
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-teal-400 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-xs text-slate-400">Dhaka, Bangladesh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Strip */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl hover:border-teal-500/30 transition-all duration-300">
            <div className="flex flex-col items-center gap-4">
              <h4 className="text-slate-100 font-semibold text-sm md:text-base flex items-center gap-2">
                <Lock size={18} className="text-teal-400" />
                Secure Payment Methods
              </h4>
              <p className="text-xs text-slate-400 text-center">We accept all major payment methods for your convenience</p>
              <div className="w-full max-w-2xl">
                <Image
                  src="/footer payment.png"
                  alt="Accepted Payment Methods - SSLCommerz, bKash, Nagad, Visa, MasterCard"
                  width={600}
                  height={80}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
              <p className="text-slate-500 text-sm text-center md:text-left">
                © {new Date().getFullYear()} ZAHAN. All rights reserved.
              </p>

              <div className="flex gap-4">
                <a
                  href="https://instagram.com/zahan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:bg-teal-500/20 hover:border-teal-500/50 hover:text-teal-400 transition-all duration-300"
                >
                  <InstagramIcon size={18} />
                </a>
                <a
                  href="https://facebook.com/zahan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:bg-teal-500/20 hover:border-teal-500/50 hover:text-teal-400 transition-all duration-300"
                >
                  <FacebookIcon size={18} />
                </a>
                <a
                  href="https://youtube.com/@zahan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:bg-teal-500/20 hover:border-teal-500/50 hover:text-teal-400 transition-all duration-300"
                >
                  <YouTubeIcon size={18} />
                </a>
                <a
                  href="https://tiktok.com/@zahan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:bg-teal-500/20 hover:border-teal-500/50 hover:text-teal-400 transition-all duration-300"
                >
                  <TikTokIcon size={18} />
                </a>
                <a
                  href="https://wa.me/8809677610610"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-400 transition-all duration-300"
                >
                  <WhatsAppIcon size={18} />
                </a>
              </div>

              <div className="flex gap-4 text-xs md:text-sm text-center md:text-right">
                <LocalizedClientLink
                  href="/privacy-policy"
                  className="text-slate-500 hover:text-teal-400 transition-colors"
                >
                  Privacy Policy
                </LocalizedClientLink>
                <span className="text-slate-700">|</span>
                <LocalizedClientLink
                  href="/terms"
                  className="text-slate-500 hover:text-teal-400 transition-colors"
                >
                  Terms & Conditions
                </LocalizedClientLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
