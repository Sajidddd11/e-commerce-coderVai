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
            <section className="relative w-full px-6 py-20 md:py-28">
                <div className="max-w-5xl mx-auto text-center mb-16">
                    <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-6 text-cyan-400/90 animate-fade-in-top">
                        Premium Collection
                    </p>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-white animate-fade-in-top leading-tight" style={{ animationDelay: '0.1s' }}>
                        About <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">ZAHAN</span>
                    </h1>
                    <p className="text-base md:text-lg font-normal text-white/70 max-w-2xl mx-auto animate-fade-in-top leading-relaxed" style={{ animationDelay: '0.2s' }}>
                        Modern Lifestyle. Designed with Purpose.
                    </p>
                </div>

                {/* Full-Width Product Banner */}
                <div className="w-full max-w-7xl mx-auto animate-fade-in-top" style={{ animationDelay: '0.3s' }}>
                    <div className="relative w-full h-[200px] xsmall:h-[240px] small:h-[320px] medium:h-[400px] large:h-[480px] overflow-hidden rounded-2xl border border-cyan-400/40 shadow-[0_0_20px_rgba(0,255,255,0.3),0_0_40px_rgba(0,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5),0_0_60px_rgba(0,255,255,0.2)] hover:border-cyan-400/60 transition-all duration-500">
                        <Image
                            src="/about-hero.jpg"
                            alt="ZAHAN Lifestyle Products - Premium Bags, Watches, Sneakers, Headphones, and Accessories"
                            fill
                            className="object-cover"
                            quality={100}
                            priority
                            unoptimized={true}
                            sizes="100vw"
                        />
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 md:py-28 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-10 md:p-14 shadow-xl hover:border-white/20 transition-all duration-300">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            About ZAHAN
                        </h2>
                        <p className="text-xl md:text-2xl font-semibold leading-relaxed text-white/80 mb-6">
                            More than a brand — a platform for opportunity.
                        </p>
                        <p className="text-base md:text-lg leading-relaxed text-white/65 mb-8">
                            ZAHAN helps people in Bangladesh who want to start a business but don't have investment capacity, sourcing access, or factory connections. We provide ready-to-sell original products at the best price with fast delivery — so you can focus on selling, not sourcing.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row gap-4">
                            <a
                                href="/store"
                                className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-semibold rounded-xl transition-all duration-300 text-center shadow-lg hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] hover:-translate-y-0.5"
                            >
                                Explore Products
                            </a>
                            <a
                                href="/contact"
                                className="px-8 py-4 border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 font-semibold rounded-xl transition-all duration-300 text-center hover:-translate-y-0.5"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Creating Business Opportunities Section */}
            <section className="py-20 md:py-28 px-6 bg-black/20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            Creating Business Opportunities
                        </h2>
                        <p className="text-base md:text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
                            ZAHAN supports unemployed youth, new entrepreneurs, and resellers (যারা ইনভেস্ট করতে পারছে না). We make business easier by providing verified products, fair pricing, and reliable supply.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {/* Value 1: Verified Sourcing */}
                        <div className="group bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-400/40 hover:shadow-[0_8px_32px_rgba(0,255,255,0.15)] transition-all duration-500 hover:-translate-y-1">
                            <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-cyan-400">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
                                Verified China Sourcing
                            </h3>
                            <p className="text-sm uppercase tracking-wider text-cyan-400/80 font-semibold mb-3">6+ Years Experience</p>
                            <p className="text-base leading-relaxed text-white/65">
                                Direct involvement in factory visits, quality checks, and original product selection. This ensures best product, best price, and stable supply.
                            </p>
                        </div>

                        {/* Value 2: Best Product */}
                        <div className="group bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-400/40 hover:shadow-[0_8px_32px_rgba(0,255,255,0.15)] transition-all duration-500 hover:-translate-y-1">
                            <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-cyan-400">
                                    <path d="M9 11l3 3L22 4" />
                                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                                </svg>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
                                Best Product
                            </h3>
                            <p className="text-sm uppercase tracking-wider text-cyan-400/80 font-semibold mb-3">Quality Certified</p>
                            <p className="text-base leading-relaxed text-white/65">
                                Authentic, certified, and rigorously quality-tested products from verified factories.
                            </p>
                        </div>

                        {/* Value 3: Best Price & Timing */}
                        <div className="group bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-400/40 hover:shadow-[0_8px_32px_rgba(0,255,255,0.15)] transition-all duration-500 hover:-translate-y-1">
                            <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-cyan-400">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
                                Best Price & Timing
                            </h3>
                            <p className="text-sm uppercase tracking-wider text-cyan-400/80 font-semibold mb-3">Fast Delivery</p>
                            <p className="text-base leading-relaxed text-white/65">
                                Factory-direct pricing with guaranteed profit margins. Always in stock, always ready to ship.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How ZAHAN Works Section */}
            <section className="py-20 md:py-28 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold mb-20 text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        How ZAHAN Works
                    </h2>

                    <div className="grid md:grid-cols-3 gap-10 md:gap-12">
                        {/* Step 1 */}
                        <div className="relative flex flex-col items-center text-center group">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 flex items-center justify-center mb-6 border-2 border-cyan-500/50 shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all duration-300">
                                <span className="text-3xl font-bold text-cyan-300">01</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
                                Factory & Quality Verification
                            </h3>
                            <p className="text-base leading-relaxed text-white/65">
                                We visit factories, verify authenticity, and ensure every product meets our quality standards before adding to our catalog.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex flex-col items-center text-center group">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 flex items-center justify-center mb-6 border-2 border-cyan-500/50 shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all duration-300">
                                <span className="text-3xl font-bold text-cyan-300">02</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
                                Ready Stock & Pricing
                            </h3>
                            <p className="text-base leading-relaxed text-white/65">
                                Products are in stock and ready to ship. Fair wholesale pricing ensures you earn good margins on every sale.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex flex-col items-center text-center group">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 flex items-center justify-center mb-6 border-2 border-cyan-500/50 shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all duration-300">
                                <span className="text-3xl font-bold text-cyan-300">03</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
                                Fast Delivery & Support
                            </h3>
                            <p className="text-base leading-relaxed text-white/65">
                                Quick processing and dispatch to your customers. Dedicated support to help you grow your business.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Closing Section */}
            <section className="py-24 md:py-32 px-6 bg-gradient-to-b from-transparent to-black/30">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-xl md:text-2xl lg:text-3xl font-normal leading-relaxed text-white/70 mb-6">
                        Built on trust, consistency, and customer satisfaction.
                    </p>
                    <p className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                        No hype. No over-promises. Just quality products, fair prices, and service that helps people grow.
                    </p>
                </div>
            </section>
        </div>
    )
}
