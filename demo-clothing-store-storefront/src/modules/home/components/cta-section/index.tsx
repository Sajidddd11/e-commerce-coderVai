"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Users, MessageCircle, Gift, TrendingUp, Facebook } from "lucide-react"

const benefits = [
  {
    icon: Gift,
    text: "Exclusive Deals",
  },
  {
    icon: MessageCircle,
    text: "Direct Support",
  },
  {
    icon: TrendingUp,
    text: "Latest Updates",
  },
]

export default function CTASection() {
  return (
    <div className="w-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-4 small:py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)',
        backgroundSize: '50px 50px'
      }}></div>

      <div className="content-container relative z-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm p-5 small:p-8 medium:p-10 border border-gray-800/50">
          {/* Content */}
          <div className="flex flex-col gap-4 small:gap-6">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-200 rounded-full mb-4 text-xs font-semibold tracking-wide">
                <Users className="w-4 h-4" />
                <span>JOIN THE COMMUNITY</span>
              </div>
              <h2 className="text-xl xsmall:text-2xl small:text-3xl medium:text-4xl font-bold text-white mb-2 small:mb-3 leading-tight">
                Connect with{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Fashion Lovers
                </span>
              </h2>
              <p className="text-slate-300 text-xs xsmall:text-sm small:text-base leading-relaxed">
                Join our exclusive Facebook community to get style inspiration, share your looks, and connect with thousands of fashion enthusiasts
              </p>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap items-center justify-center gap-4 small:gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div key={index} className="flex items-center gap-2 text-white">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/20">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs small:text-sm font-medium">{benefit.text}</span>
                  </div>
                )
              })}
            </div>

            {/* CTAs */}
            <div className="flex flex-col xsmall:flex-row gap-4 items-center justify-center max-w-2xl mx-auto w-full">
              {/* Facebook Group CTA */}
              <a
                href="https://facebook.com/groups/zahan-fashion-community"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 xsmall:gap-3 px-6 xsmall:px-8 py-3 xsmall:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl text-sm xsmall:text-base transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 group whitespace-nowrap w-full xsmall:w-auto"
              >
                <Facebook className="w-5 h-5" />
                <span>Join Facebook Group</span>
                <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </a>

              {/* OR Divider */}
              <div className="flex xsmall:hidden items-center gap-2 w-full">
                <div className="h-px flex-1 bg-slate-600"></div>
                <span className="text-slate-400 text-xs font-semibold">OR</span>
                <div className="h-px flex-1 bg-slate-600"></div>
              </div>
              <div className="hidden xsmall:flex items-center gap-2">
                <span className="text-slate-400 text-xs font-semibold">OR</span>
              </div>

              {/* Explore Store CTA */}
              <LocalizedClientLink
                href="/store"
                className="inline-flex items-center justify-center gap-2 xsmall:gap-3 px-6 xsmall:px-8 py-3 xsmall:py-4 bg-white text-slate-900 font-semibold rounded-xl text-sm xsmall:text-base hover:bg-slate-50 transition-all duration-300 hover:shadow-lg hover:shadow-white/20 group whitespace-nowrap w-full xsmall:w-auto"
              >
                Explore Collection
                <span className="group-hover:translate-x-1 transition-transform inline-block text-lg">→</span>
              </LocalizedClientLink>
            </div>

            {/* Member count */}
            <div className="text-center">
              <p className="text-slate-300 text-sm small:text-base font-semibold">
                <span className="text-cyan-400">10,000+</span> members already in our community
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
