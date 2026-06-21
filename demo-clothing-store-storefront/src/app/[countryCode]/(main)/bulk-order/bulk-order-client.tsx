"use client"

import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

// ─── Types ────────────────────────────────────────────────────────────────────

type BulkRecord = {
    id: string
    product_id: string
    is_active: boolean
    min_quantity: number | null
    notes: string | null
}

type Props = {
    products: HttpTypes.StoreProduct[]
    bulkMap: Record<string, BulkRecord>
    region: HttpTypes.StoreRegion
    countryCode: string
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = "8801304117711"

function buildWhatsAppLink(productName?: string) {
    const msg = productName
        ? `Hi, I'm interested in placing a bulk order for "${productName}". Please share pricing and availability.`
        : `Hi, I'd like to inquire about bulk ordering from ZAHAN. Please share your bulk pricing details.`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
}

// ─── WhatsApp Icon ────────────────────────────────────────────────────────────

function WhatsAppIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    )
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function BulkProductCard({
    product,
    bulkRecord,
}: {
    product: HttpTypes.StoreProduct
    bulkRecord: BulkRecord
    region: HttpTypes.StoreRegion
}) {
    const { cheapestPrice } = getProductPrice({ product })
    const refPrice = cheapestPrice?.calculated_price || cheapestPrice?.original_price || null

    return (
        <div className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#56aebf]/40 hover:shadow-[0_8px_32px_rgba(86,174,191,0.15)] transition-all duration-500 hover:-translate-y-1">
            {/* Image */}
            <LocalizedClientLink href={`/products/${product.handle}`}>
                <div className="relative w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                    <Thumbnail
                        thumbnail={product.thumbnail}
                        images={product.images}
                        size="full"
                    />
                    {/* Bulk badge */}
                    <div className="absolute top-3 left-3">
                        <span className="bg-[#56aebf] text-white shadow-md text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
                            Bulk
                        </span>
                    </div>
                </div>
            </LocalizedClientLink>

            {/* Content */}
            <div className="flex flex-col flex-1 p-3 sm:p-4 gap-2 sm:gap-3 bg-white">
                {/* Category */}
                {product.type && (
                    <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-[#56aebf]">
                        {product.type.value}
                    </p>
                )}

                {/* Title */}
                <LocalizedClientLink href={`/products/${product.handle}`}>
                    <h3 className="font-inter font-medium text-sm sm:text-base text-slate-900 line-clamp-2 hover:text-[#56aebf] transition-colors leading-snug">
                        {product.title}
                    </h3>
                </LocalizedClientLink>

                {/* Min Quantity */}
                {bulkRecord.min_quantity && (
                    <p className="text-[10px] sm:text-xs text-slate-500">
                        Min. order:{" "}
                        <span className="text-[#56aebf] font-semibold">{bulkRecord.min_quantity} units</span>
                    </p>
                )}

                {/* Notes */}
                {bulkRecord.notes && (
                    <p className="text-[10px] sm:text-xs text-slate-400 italic line-clamp-2">{bulkRecord.notes}</p>
                )}

                {/* Pricing Block */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 sm:p-2.5 mt-1">
                    {refPrice && (
                        <div className="flex justify-between items-center text-[10px] sm:text-xs mb-1">
                            <span className="text-slate-500">Regular Retail:</span>
                            <span className="text-slate-400 line-through font-medium">{refPrice}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-[10px] sm:text-xs">
                        <span className="text-slate-700 font-medium">Bulk Price:</span>
                        <span className="text-[#56aebf] font-bold">Contact for Quote</span>
                    </div>
                </div>

                <div className="flex-1" />

                {/* WhatsApp CTA */}
                <a
                    href={buildWhatsAppLink(product.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-2 sm:py-3 px-2 sm:px-4 bg-[#56aebf] hover:bg-[#458f9e] text-white font-semibold text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-[0_4px_12px_rgba(86,174,191,0.3)] hover:-translate-y-0.5"
                >
                    <WhatsAppIcon size={16} />
                    <span className="hidden sm:inline">Contact for Purchase</span>
                    <span className="sm:hidden">Contact</span>
                </a>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BulkOrderClient({ products, bulkMap, region, countryCode }: Props) {
    const generalWhatsApp = buildWhatsAppLink()

    return (
        <div className="min-h-screen bg-black">

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <section className="relative w-full px-6 py-12 md:py-16">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase mb-4 text-[#56aebf]/90 animate-fade-in-top">
                        Wholesale &amp; Bulk
                    </p>
                    <h1 className="font-montserrat text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white animate-fade-in-top leading-tight" style={{ animationDelay: "0.1s" }}>
                        Bulk <span className="text-[#56aebf]">Orders</span>
                    </h1>
                    <p className="font-inter text-sm md:text-base font-normal text-white/70 max-w-xl mx-auto animate-fade-in-top leading-relaxed mb-6" style={{ animationDelay: "0.2s" }}>
                        Order large quantities of our products at special wholesale pricing.
                        Browse below and contact us on WhatsApp for a custom quote.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-top" style={{ animationDelay: "0.3s" }}>
                        <a
                            href={generalWhatsApp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#56aebf] hover:bg-[#458f9e] text-black font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(86,174,191,0.5)] hover:-translate-y-0.5"
                        >
                            <WhatsAppIcon size={18} />
                            Chat on WhatsApp
                        </a>
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
                            }}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#56aebf]/50 text-[#56aebf] hover:bg-[#56aebf]/10 hover:border-[#56aebf] font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                        >
                            Browse Products
                        </button>
                    </div>
                </div>
            </section>

            {/* ── How It Works ──────────────────────────────────────────────── */}
            <section className="py-12 px-6 bg-black/20">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            {
                                num: "01",
                                title: "Browse Products",
                                desc: "Pick from our bulk-available catalog",
                            },
                            {
                                num: "02",
                                title: "Contact via WhatsApp",
                                desc: "Click the button on any product to start a chat",
                            },
                            {
                                num: "03",
                                title: "Get Custom Quote",
                                desc: "We reply with wholesale pricing & arrange your order",
                            },
                        ].map((item) => (
                            <div
                                key={item.num}
                                className="group flex flex-col items-center text-center p-6 bg-white/[0.03] border border-[#56aebf]/20 rounded-2xl hover:border-[#56aebf]/40 hover:shadow-[0_8px_32px_rgba(86,174,191,0.1)] transition-all duration-300"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-[#56aebf]/20 flex items-center justify-center mb-4 border border-[#56aebf]/30 group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(86,174,191,0.3)] transition-all duration-300">
                                    <span className="text-2xl font-bold text-[#56aebf]">{item.num}</span>
                                </div>
                                <h3 className="font-montserrat font-semibold text-base text-white mb-2">{item.title}</h3>
                                <p className="font-inter text-sm text-white/55 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Products Grid ─────────────────────────────────────────────── */}
            <section id="products" className="py-16 md:py-20 bg-gray-50">
                <div className="content-container">
                    {products.length === 0 ? (
                        <div className="text-center py-24 space-y-5 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
                            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#56aebf]/10 border border-[#56aebf]/20 flex items-center justify-center">
                                <svg className="w-10 h-10 text-[#56aebf]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                            </div>
                            <h2 className="font-montserrat text-2xl font-bold text-slate-900">No bulk products yet</h2>
                            <p className="font-inter text-slate-500 max-w-sm mx-auto text-sm">
                                Bulk products are being set up. Contact us directly for wholesale pricing.
                            </p>
                            <a
                                href={generalWhatsApp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-2 px-6 py-3 bg-[#56aebf] hover:bg-[#458f9e] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                            >
                                <WhatsAppIcon size={18} />
                                Contact Us on WhatsApp
                            </a>
                        </div>
                    ) : (
                        <>
                            {/* Section header */}
                            <div className="mb-8">
                                <h2 className="font-montserrat text-2xl md:text-3xl font-bold text-slate-900">
                                    Available for Bulk
                                </h2>
                                <p className="font-inter text-slate-500 text-sm mt-1">
                                    {products.length} product{products.length !== 1 ? "s" : ""} — contact us for wholesale pricing
                                </p>
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-2 medium:grid-cols-3 large:grid-cols-4 gap-3 sm:gap-5">
                                {products.map((product) => {
                                    const bulkRecord = bulkMap[product.id]
                                    if (!bulkRecord) return null
                                    return (
                                        <BulkProductCard
                                            key={product.id}
                                            product={product}
                                            bulkRecord={bulkRecord}
                                            region={region}
                                        />
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* ── Bottom CTA ────────────────────────────────────────────────── */}
            <section className="py-20 md:py-28 px-6 bg-gradient-to-b from-transparent to-black/30">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/[0.03] backdrop-blur-2xl border border-[#56aebf]/20 rounded-2xl p-10 md:p-14 text-center hover:border-[#56aebf]/30 transition-all duration-300">
                        <h2 className="font-montserrat text-2xl md:text-3xl font-bold text-[#56aebf] mb-4">
                            Don&apos;t see what you need?
                        </h2>
                        <p className="font-inter text-base text-white/65 mb-8 max-w-xl mx-auto leading-relaxed">
                            We can arrange bulk orders for any product in our catalog.
                            Message us on WhatsApp and we&apos;ll work out a custom deal for you.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href={generalWhatsApp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#56aebf] hover:bg-[#458f9e] text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(86,174,191,0.5)] hover:-translate-y-0.5"
                            >
                                <WhatsAppIcon size={20} />
                                Contact on WhatsApp
                            </a>
                            <LocalizedClientLink
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#56aebf]/50 text-[#56aebf] hover:bg-[#56aebf]/10 hover:border-[#56aebf] font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                            >
                                Other Ways to Contact
                            </LocalizedClientLink>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
