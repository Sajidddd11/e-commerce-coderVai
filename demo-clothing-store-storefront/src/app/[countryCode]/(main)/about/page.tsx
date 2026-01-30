import { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
    title: "About ZAHAN | Fashion and Lifestyle",
    description: "More than a brand — a platform for opportunity. ZAHAN helps entrepreneurs in Bangladesh start their business with verified products, fair pricing, and fast delivery.",
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e]">
            {/* Hero Section */}
            <section className="relative w-full px-6 py-20">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <p className="text-xs tracking-[0.3em] uppercase mb-6 text-cyan-400 animate-fade-in-top">
                        Premium Collection
                    </p>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-white/90 animate-fade-in-top" style={{ animationDelay: '0.1s' }}>
                        About ZAHAN
                    </h1>
                    <p className="text-lg md:text-xl font-light tracking-wide text-white/60 animate-fade-in-top" style={{ animationDelay: '0.2s' }}>
                        Modern Lifestyle. Designed with Purpose.
                    </p>
                </div>

                {/* Full-Width Product Banner */}
                <div className="w-full max-w-7xl mx-auto animate-fade-in-top" style={{ animationDelay: '0.3s' }}>
                    <div className="relative w-full h-[280px] small:h-[360px] medium:h-[420px] large:h-[480px] overflow-hidden rounded-lg border border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.5)] hover:shadow-[0_0_25px_rgba(0,255,255,0.8)] transition-all duration-300">
                        <Image
                            src="/about-hero.jpg"
                            alt="ZAHAN Lifestyle Products - Premium Bags, Watches, Sneakers, Headphones, and Accessories"
                            fill
                            className="object-cover"
                            quality={95}
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1280px"
                        />
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in-top" style={{ animationDelay: '0.4s' }}>
                    <div className="w-6 h-10 border-2 rounded-full flex justify-center pt-2 border-cyan-500/50">
                        <div className="w-1 h-2 rounded-full animate-bounce bg-cyan-500"></div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 md:py-32 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            About ZAHAN
                        </h2>
                        <p className="text-lg md:text-xl leading-relaxed font-light text-white/60 mb-6">
                            More than a brand — a platform for opportunity.
                        </p>
                        <p className="text-lg leading-relaxed font-light text-white/60 mb-6">
                            ZAHAN helps people in Bangladesh who want to start a business but don't have investment capacity, sourcing access, or factory connections. We provide ready-to-sell original products at the best price with fast delivery — so you can focus on selling, not sourcing.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <a
                                href="/store"
                                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold rounded-lg transition-all duration-300 text-center hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]"
                            >
                                Explore Products
                            </a>
                            <a
                                href="/contact"
                                className="px-6 py-3 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-semibold rounded-lg transition-all duration-300 text-center"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Creating Business Opportunities Section */}
            <section className="py-24 md:py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Creating Business Opportunities
                    </h2>
                    <p className="text-center text-white/60 mb-16 max-w-3xl mx-auto">
                        ZAHAN supports unemployed youth, new entrepreneurs, and resellers (যারা ইনভেস্ট করতে পারছে না). We make business easier by providing verified products, fair pricing, and reliable supply.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        {/* Value 1: Verified Sourcing */}
                        <div className="bg-[rgba(15,15,30,0.4)] backdrop-blur-2xl border border-cyan-500/10 rounded-2xl p-8 hover:shadow-[0_0_30px_rgba(0,255,255,0.5),inset_0_0_20px_rgba(0,255,255,0.1)] hover:border-cyan-500/30 transition-all duration-300">
                            <div className="w-12 h-12 mb-6 flex items-center justify-center">
                                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-cyan-400">
                                    <path d="M24 4 L32 14 L44 14 L36 20 L40 30 L24 24 L8 30 L12 20 L4 14 L16 14 Z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-cyan-400">
                                Verified China Sourcing (6+ Years)
                            </h3>
                            <p className="font-light leading-relaxed text-white/60">
                                For more than 6 years, ZAHAN has been directly involved in China sourcing — factory visits, quality checks, and original product selection. This ensures best product, best price, and stable supply.
                            </p>
                        </div>

                        {/* Value 2: Best Product */}
                        <div className="bg-[rgba(15,15,30,0.4)] backdrop-blur-2xl border border-cyan-500/10 rounded-2xl p-8 hover:shadow-[0_0_30px_rgba(0,255,255,0.5),inset_0_0_20px_rgba(0,255,255,0.1)] hover:border-cyan-500/30 transition-all duration-300">
                            <div className="w-12 h-12 mb-6 flex items-center justify-center">
                                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-cyan-400">
                                    <rect x="12" y="10" width="24" height="28" rx="2" />
                                    <path d="M18 20 L22 24 L30 16" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-cyan-400">
                                Best Product
                            </h3>
                            <p className="font-light leading-relaxed text-white/60">
                                Authentic, certified, and rigorously quality-tested products from verified factories.
                            </p>
                        </div>

                        {/* Value 3: Best Price & Timing */}
                        <div className="bg-[rgba(15,15,30,0.4)] backdrop-blur-2xl border border-cyan-500/10 rounded-2xl p-8 hover:shadow-[0_0_30px_rgba(0,255,255,0.5),inset_0_0_20px_rgba(0,255,255,0.1)] hover:border-cyan-500/30 transition-all duration-300">
                            <div className="w-12 h-12 mb-6 flex items-center justify-center">
                                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-cyan-400">
                                    <circle cx="24" cy="24" r="18" />
                                    <path d="M24 12 L24 24 L32 28" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-cyan-400">
                                Best Price & Timing
                            </h3>
                            <p className="font-light leading-relaxed text-white/60">
                                Factory-direct pricing with guaranteed profit margins. Always in stock, always ready to ship — guaranteed fast delivery every time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How ZAHAN Works Section */}
            <section className="py-24 md:py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        How ZAHAN Works
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6 border border-cyan-500/50">
                                <span className="text-xl font-bold text-cyan-400">01</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white/90">
                                Factory & Quality Verification
                            </h3>
                            <p className="font-light text-white/60">
                                We visit factories, verify authenticity, and ensure every product meets our quality standards before adding to our catalog.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6 border border-cyan-500/50">
                                <span className="text-xl font-bold text-cyan-400">02</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white/90">
                                Ready Stock & Pricing
                            </h3>
                            <p className="font-light text-white/60">
                                Products are in stock and ready to ship. Fair wholesale pricing ensures you earn good margins on every sale.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6 border border-cyan-500/50">
                                <span className="text-xl font-bold text-cyan-400">03</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white/90">
                                Fast Delivery & Support
                            </h3>
                            <p className="font-light text-white/60">
                                Quick processing and dispatch to your customers. Dedicated support to help you grow your business.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Closing Section */}
            <section className="py-32 md:py-48 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-white/60 mb-4">
                        Built on trust, consistency, and customer satisfaction.
                    </p>
                    <p className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        No hype. No over-promises. Just quality products, fair prices, and service that helps people grow.
                    </p>
                </div>
            </section>
        </div>
    )
}
