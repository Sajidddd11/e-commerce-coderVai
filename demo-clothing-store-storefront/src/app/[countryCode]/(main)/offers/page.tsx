import { Metadata } from "next"
import WholesaleLink from "@modules/common/components/wholesale-link"

export const metadata: Metadata = {
    title: "Offers & Deals | ZAHAN",
    description: "Exclusive savings, fair pricing, and limited-time opportunities on ZAHAN.",
}

export default function OffersPage() {
    return (
        <div className="min-h-screen bg-black">
            {/* Custom Styles for Animation Loop */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 15px rgba(86,174,191,0.1); border-color: rgba(86,174,191,0.2); }
                    50% { box-shadow: 0 0 35px rgba(86,174,191,0.5); border-color: rgba(86,174,191,0.6); }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 3s infinite;
                }
                
                @keyframes type-loop {
                    0%, 15% { content: "SAVE20"; }
                    20%, 35% { content: "WELCOME10"; }
                    40%, 55% { content: "ZAHAN50"; }
                    60%, 75% { content: "FREESHIP"; }
                    80%, 95% { content: "WHOLESALE"; }
                    100% { content: "SAVE20"; }
                }
                .animated-placeholder::before {
                    content: "SAVE20";
                    animation: type-loop 10s infinite;
                    color: rgba(86,174,191,0.9);
                }

                @keyframes scan-line {
                    0% { transform: translateX(-10px); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateX(250px); opacity: 0; }
                }
                .animate-scan {
                    animation: scan-line 2s linear infinite;
                }

                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .animate-blink {
                    animation: blink 1s infinite;
                }
            `}} />

            {/* Hero Section */}
            <section className="relative py-24 md:py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-white animate-fade-in-top">
                        Offers & <span className="text-[#56aebf]">Deals</span>
                    </h1>
                    <p className="text-lg md:text-xl font-light tracking-wide text-white/70 mb-12 animate-fade-in-top" style={{ animationDelay: '0.1s' }}>
                        Exclusive savings. Fair pricing. Limited-time opportunities.
                    </p>
                    <div className="flex justify-center animate-fade-in-top" style={{ animationDelay: '0.2s' }}>
                        <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#56aebf] to-transparent shadow-[0_0_20px_rgba(86,174,191,0.8)]"></div>
                    </div>
                </div>
            </section>

            {/* Offers Grid Section */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-white/[0.03] backdrop-blur-2xl p-8 rounded-2xl border border-white/10 hover:border-[#56aebf]/40 hover:shadow-[0_8px_32px_rgba(86,174,191,0.15)] transition-all duration-500 hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Seasonal Offers</h3>
                                    <p className="text-white/70 font-light leading-relaxed">Special pricing on selected lifestyle products for a limited time.</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-8">
                                <span className="bg-[#56aebf]/10 border border-[#56aebf]/30 text-[#56aebf] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Limited</span>
                                <a href="/store" className="border-2 border-[#56aebf]/50 text-[#56aebf] hover:bg-[#56aebf]/10 hover:border-[#56aebf] text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300">View Offers</a>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white/[0.03] backdrop-blur-2xl p-8 rounded-2xl border border-white/10 hover:border-[#56aebf]/40 hover:shadow-[0_8px_32px_rgba(86,174,191,0.15)] transition-all duration-500 hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Wholesale Deals</h3>
                                    <p className="text-white/70 font-light leading-relaxed">Exclusive margin-friendly offers for resellers and business partners.</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-8">
                                <span className="bg-[#56aebf]/10 border border-[#56aebf]/30 text-[#56aebf] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Partners</span>
                                <WholesaleLink className="border-2 border-[#56aebf]/50 text-[#56aebf] hover:bg-[#56aebf]/10 hover:border-[#56aebf] text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300">Learn More</WholesaleLink>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white/[0.03] backdrop-blur-2xl p-8 rounded-2xl border border-white/10 hover:border-[#56aebf]/40 hover:shadow-[0_8px_32px_rgba(86,174,191,0.15)] transition-all duration-500 hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Campaign Highlights</h3>
                                    <p className="text-white/70 font-light leading-relaxed">Time-bound promotions aligned with stock availability and demand.</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-8">
                                <span className="bg-[#56aebf]/10 border border-[#56aebf]/30 text-[#56aebf] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Active</span>
                                <a href="/store" className="border-2 border-[#56aebf]/50 text-[#56aebf] hover:bg-[#56aebf]/10 hover:border-[#56aebf] text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300">Explore</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coupon Section (Animated Loop) */}
            <section className="py-20 px-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white/[0.03] backdrop-blur-2xl p-10 md:p-12 rounded-2xl border border-[#56aebf]/30 animate-pulse-glow text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#56aebf]/5 to-transparent pointer-events-none"></div>
                        
                        <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Coupons & Promo Codes</h2>
                        <p className="text-white/70 font-light mb-8 relative z-10">Valid coupon codes are applied automatically at checkout.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto relative z-10">
                            <div className="relative flex-1">
                                <div className="w-full bg-black/40 border border-white/20 text-white px-4 py-3 rounded-xl text-left h-[50px] flex items-center overflow-hidden">
                                    <span className="animated-placeholder font-mono text-base font-semibold tracking-widest"></span>
                                    <span className="w-2 h-5 bg-[#56aebf] ml-1 animate-blink"></span>
                                </div>
                                {/* Scanning line animation over the input */}
                                <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#56aebf] shadow-[0_0_15px_#56aebf] opacity-70 animate-scan"></div>
                            </div>
                            <button className="bg-[#56aebf] text-black font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(86,174,191,0.4)] whitespace-nowrap cursor-default relative overflow-hidden group-hover:bg-[#458f9e]">
                                <span className="relative z-10">Auto-Applying</span>
                                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[slide_1.5s_infinite]"></div>
                            </button>
                        </div>
                    </div>
                </div>
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes slide {
                        100% { transform: translateX(100%) skewX(-12deg); }
                    }
                `}} />
            </section>

            {/* Trust Statement Section */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-xl md:text-2xl font-light text-white/70 leading-relaxed">
                        No fake discounts. No misleading prices.<br/>
                        <span className="text-[#56aebf] font-medium mt-2 block">Only fair offers on verified products.</span>
                    </p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 pb-32">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-12 rounded-2xl hover:border-[#56aebf]/30 transition-colors duration-500">
                        <h2 className="text-3xl font-bold text-white mb-8">Ready to explore?</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/store" className="bg-[#56aebf] hover:bg-[#458f9e] text-black font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(86,174,191,0.5)] hover:-translate-y-0.5">
                                Explore Products
                            </a>
                            <WholesaleLink className="border-2 border-[#56aebf]/50 text-[#56aebf] hover:bg-[#56aebf]/10 hover:border-[#56aebf] font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5">
                                Wholesale & Collaboration
                            </WholesaleLink>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
