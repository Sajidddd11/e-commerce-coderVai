"use client"

import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Sparkles } from "lucide-react"

const SignInPrompt = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 shadow-lg group hover:shadow-xl transition-shadow duration-300">
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative flex items-center justify-between gap-4">
        {/* Left side - Text */}
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-white animate-pulse flex-shrink-0" />
          <span className="text-white font-semibold text-base sm:text-lg">
            Sign in to unlock exclusive benefits & faster checkout!
          </span>
        </div>

        {/* Right side - CTA Button */}
        <LocalizedClientLink href="/account">
          <Button
            className="px-6 py-2 bg-white hover:bg-gray-100 text-slate-900 font-bold rounded-lg shadow-md transform transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
            data-testid="sign-in-button"
          >
            Sign In
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
