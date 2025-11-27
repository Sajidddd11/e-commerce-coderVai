"use client"

import { HttpTypes } from "@medusajs/types"
import { useEffect, useRef, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

interface FeaturedCarouselProps {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  title?: string
}

export default function FeaturedCarousel({
  products,
  region,
  title = "Featured Collection",
}: FeaturedCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkScroll)
    }
    return () => {
      window.removeEventListener("resize", checkScroll)
      if (container) {
        container.removeEventListener("scroll", checkScroll)
      }
    }
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-white py-16 small:py-24">
      <div className="content-container">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col small:flex-row small:items-center small:justify-between gap-4">
            <div>
              <h2 className="text-2xl small:text-3xl font-bold text-slate-900">
                {title}
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                Scroll to explore our best-selling items
              </p>
            </div>
          </div>

          {/* Carousel Container */}
          <div className="relative group">
            {/* Left Arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 small:p-3 bg-white border border-slate-200 text-slate-900 rounded-full hover:bg-slate-50 shadow-md transition-all duration-300"
                aria-label="Scroll left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Products Carousel */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-4 small:gap-6 pb-4 scroll-smooth no-scrollbar"
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-48 small:w-64 hover:shadow-lg transition-all duration-300"
                >
                  <ProductPreview product={product} region={region} isFeatured />
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 small:p-3 bg-white border border-slate-200 text-slate-900 rounded-full hover:bg-slate-50 shadow-md transition-all duration-300"
                aria-label="Scroll right"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* View All Link */}
          <div className="flex justify-center pt-4">
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center gap-2 text-slate-900 hover:text-slate-600 font-semibold text-base group transition-colors"
            >
              View All Featured Products
              <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}
