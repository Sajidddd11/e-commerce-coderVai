"use client"

import { Truck, Shield, RefreshCcw, HeadphonesIcon, Award, Clock } from "lucide-react"

const features = [
  {
    icon: Truck,
    title: "Fast & Free Shipping",
    description: "Express delivery within 2-3 business days nationwide",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "100% Secure Payment",
    description: "SSL encrypted checkout with trusted payment gateways",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: RefreshCcw,
    title: "Easy Returns",
    description: "30-day money-back guarantee, no questions asked",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Customer Support",
    description: "Dedicated support team ready to help anytime",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Curated collection of authentic branded products",
    color: "from-yellow-500 to-amber-500",
  },
  {
    icon: Clock,
    title: "Quick Processing",
    description: "Orders processed and shipped within 24 hours",
    color: "from-indigo-500 to-violet-500",
  },
]

export default function TrustSection() {
  return (
    <div className="w-full bg-slate-50 py-4 small:py-8 pt-2 small:pt-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tr from-pink-200 to-orange-200 rounded-full blur-3xl"></div>
      </div>

      <div className="content-container relative z-10">
        <div className="flex flex-col gap-4 small:gap-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-full mb-4 text-xs font-semibold tracking-wide">
              <Award className="w-4 h-4" />
              <span>WHY CHOOSE US</span>
            </div>
            <h2 className="text-xl xsmall:text-2xl small:text-3xl medium:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-2 small:mb-3">
              Experience Shopping Excellence
            </h2>
            <p className="text-slate-600 text-xs xsmall:text-sm small:text-base max-w-3xl mx-auto leading-relaxed">
              We're committed to delivering exceptional quality, unbeatable prices, and outstanding service that keeps our customers coming back
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 medium:grid-cols-3 gap-3 small:gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl p-4 small:p-5 shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 hover:border-transparent overflow-hidden"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Hover gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`inline-flex p-2 small:p-2.5 rounded-xl bg-gradient-to-br ${feature.color} mb-3 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                      <Icon className="w-5 h-5 small:w-6 small:h-6 text-white" strokeWidth={2.5} />
                    </div>

                    {/* Text */}
                    <h3 className="font-bold text-slate-900 text-sm small:text-base mb-1.5 group-hover:text-slate-950 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-xs small:text-sm leading-relaxed hidden xsmall:block">
                      {feature.description}
                    </p>
                  </div>

                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                </div>
              )
            })}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 small:gap-6 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-slate-700">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-xs small:text-sm font-semibold">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="text-xs small:text-sm font-semibold">Verified Seller</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="text-lg">⭐</span>
              <span className="text-xs small:text-sm font-semibold">4.8/5 Customer Rating</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="text-lg">🎉</span>
              <span className="text-xs small:text-sm font-semibold">10K+ Happy Customers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
