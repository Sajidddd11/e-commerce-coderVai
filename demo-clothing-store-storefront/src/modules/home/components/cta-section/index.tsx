import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CTASection() {
  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-16 small:py-24">
      <div className="content-container">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 small:p-16">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-slate-600/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-slate-600/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 flex flex-col small:flex-row small:items-center small:justify-between gap-8 small:gap-12">
            <div className="flex-1 flex flex-col gap-4">
              <h2 className="text-3xl small:text-4xl font-bold text-white">
                Join Our Community
              </h2>
              <p className="text-slate-300 text-base leading-relaxed max-w-xl">
                Subscribe to our newsletter and get exclusive offers, styling tips, and early access to new collections
              </p>
            </div>

            <div className="w-full small:w-auto">
              <LocalizedClientLink
                href="/store"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-all duration-300 hover:shadow-lg hover:shadow-white/10 group whitespace-nowrap w-full small:w-auto"
              >
                Explore Now
                <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
