"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HeroSlide } from "@lib/data/hero"

interface HomeHeroProps {
  slides?: HeroSlide[]
}

export default function HomeHero({ slides }: HomeHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const activeSlides: HeroSlide[] = slides && slides.length > 0
    ? slides
    : [
        {
          id: "default-1",
          slide_type: "static_image",
          title: "Shop All Categories",
          description: "Explore our full range of premium apparel and accessories. Direct from our curated collections.",
          button_text: "Shop Now",
          button_link: "/store",
          background_image: "/banners/all.png",
          side_image: null,
          video_url: null,
          overlay_color: "rgba(0, 0, 0, 0.3)",
          sort_order: 1,
          is_active: true,
          created_at: "",
          updated_at: ""
        },
        {
          id: "default-2",
          slide_type: "side_image_left",
          title: "Premium Audio Collection",
          description: "Elevate your listening experience with high-fidelity sound, deep bass, and comfortable fit.",
          button_text: "Discover Audio",
          button_link: "/categories/headphones",
          background_image: null,
          side_image: "/banners/headphone.jpg",
          video_url: null,
          overlay_color: "linear-gradient(135deg, #1e293b, #0f172a)",
          sort_order: 2,
          is_active: true,
          created_at: "",
          updated_at: ""
        },
        {
          id: "default-3",
          slide_type: "side_image_right",
          title: "Step into Comfort",
          description: "Performance and style combined in our latest sneakers. Designed for everyday lifestyle and motion.",
          button_text: "Shop Sneakers",
          button_link: "/categories/sneakers",
          background_image: null,
          side_image: "/banners/snicker.jpg",
          video_url: null,
          overlay_color: "linear-gradient(135deg, #111827, #1f2937)",
          sort_order: 3,
          is_active: true,
          created_at: "",
          updated_at: ""
        },
        {
          id: "default-4",
          slide_type: "center_text",
          title: "Luxury Timepieces",
          description: "Exquisite designs crafting timeless sophistication. Explore watches that define who you are.",
          button_text: "Explore Watches",
          button_link: "/categories/watches",
          background_image: "/banners/watch.jpg",
          side_image: null,
          video_url: null,
          overlay_color: "rgba(0, 0, 0, 0.4)",
          sort_order: 4,
          is_active: true,
          created_at: "",
          updated_at: ""
        }
      ]

  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlay, activeSlides.length])

  const goToPrevious = () => {
    setIsAutoPlay(false)
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)
  }

  const goToNext = () => {
    setIsAutoPlay(false)
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlay(false)
    setCurrentSlide(index)
  }

  const hasSplitLayout = activeSlides.some(
    (slide) => slide.slide_type === "side_image_left" || slide.slide_type === "side_image_right"
  )

  return (
    <section className="relative w-full bg-grey-90 overflow-hidden" role="banner">
      {/* Carousel Container */}
      <div className={`relative w-full transition-all duration-300 ${
        hasSplitLayout
          ? "h-[450px] xsmall:h-[500px] small:h-[550px] medium:h-[600px]"
          : "h-[180px] xsmall:h-[220px] small:h-[280px] medium:h-[350px] large:h-[400px]"
      }`}>
        {/* Slides */}
        {activeSlides.map((slide, index) => {
          const isActive = index === currentSlide

          return (
            <div
              key={slide.id || `slide-${index}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide
                ? "opacity-100 z-10 pointer-events-auto"
                : "opacity-0 z-0 pointer-events-none"
                }`}
            >
              <div className="relative w-full h-full overflow-hidden">
                {/* Background Layer for Static Image or Center Text or Video Poster */}
                {slide.background_image && (slide.slide_type === "static_image" || slide.slide_type === "center_text" || slide.slide_type === "video") && (
                  <Image
                    src={slide.background_image}
                    alt={slide.title || "Background"}
                    fill
                    className={`object-cover transition-transform duration-10000 ease-linear ${
                      isActive ? "scale-105" : "scale-100"
                    }`}
                    priority={index === 0}
                    sizes="100vw"
                  />
                )}

                {/* Video Background */}
                {slide.slide_type === "video" && slide.video_url && (
                  <video
                    src={slide.video_url}
                    poster={slide.background_image || undefined}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Background Overlay (Solid/Gradient) */}
                {slide.overlay_color && (slide.slide_type === "static_image" || slide.slide_type === "center_text" || slide.slide_type === "video") && (
                  <div
                    className="absolute inset-0 z-10"
                    style={{ background: slide.overlay_color }}
                  />
                )}

                {/* Layout Content */}
                {/* 1. Split Layouts (side_image_left, side_image_right) */}
                {(slide.slide_type === "side_image_left" || slide.slide_type === "side_image_right") ? (
                  <div className={`relative z-20 w-full h-full flex flex-col ${
                    slide.slide_type === "side_image_right" ? "medium:flex-row-reverse" : "medium:flex-row"
                  }`}>
                    {/* Text/Content Column */}
                    <div 
                      className="w-full medium:w-1/2 h-1/2 medium:h-full flex flex-col justify-center px-6 xsmall:px-12 small:px-16 medium:px-20 py-8 medium:py-12 text-white"
                      style={slide.overlay_color ? { background: slide.overlay_color } : { background: "linear-gradient(135deg, #111827, #1f2937)" }}
                    >
                      <div className={`max-w-xl transition-all duration-700 delay-300 transform ${
                        isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                      }`}>
                        {slide.title && (
                          <h1 className="text-xl xsmall:text-2xl small:typography-hero text-white mb-2 small:mb-4 leading-tight">
                            {slide.title}
                          </h1>
                        )}
                        {slide.description && (
                          <p className="text-xs xsmall:text-sm small:typography-body-lg text-grey-20 mb-3 small:mb-6 max-w-md">
                            {slide.description}
                          </p>
                        )}
                        {slide.button_text && slide.button_link && (
                          <div>
                            <LocalizedClientLink
                              href={slide.button_link}
                              className="text-xs xsmall:text-sm small:typography-button inline-flex items-center justify-center px-4 py-2 small:px-6 small:py-3 bg-white text-grey-90 rounded-md hover:bg-grey-10 transition-all duration-200 hover:shadow-lg active:scale-95 whitespace-nowrap"
                            >
                              {slide.button_text}
                            </LocalizedClientLink>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image Column */}
                    <div className="w-full medium:w-1/2 h-1/2 medium:h-full relative overflow-hidden bg-grey-90">
                      {slide.side_image && (
                        <Image
                          src={slide.side_image}
                          alt={slide.title || "Side Image"}
                          fill
                          className={`object-cover transition-transform duration-7000 ease-out ${
                            isActive ? "scale-105" : "scale-100"
                          }`}
                          sizes="(max-width: 1280px) 100vw, 50vw"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  /* 2. Full Overlay Layouts (center_text, static_image, video) */
                  <div className={`relative z-20 w-full h-full flex flex-col justify-center px-6 xsmall:px-12 small:px-16 medium:px-20 text-white ${
                    slide.slide_type === "center_text" ? "items-center text-center" : "items-start text-left"
                  }`}>
                    <div className={`max-w-2xl transition-all duration-700 delay-300 transform ${
                      isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    }`}>
                      {slide.title && (
                        <h1 className="text-xl xsmall:text-2xl small:typography-hero text-white mb-2 small:mb-4 leading-tight">
                          {slide.title}
                        </h1>
                      )}
                      {slide.description && (
                        <p className="text-xs xsmall:text-sm small:typography-body-lg text-grey-10 mb-3 small:mb-8 max-w-xl mx-auto">
                          {slide.description}
                        </p>
                      )}
                      {slide.button_text && slide.button_link && (
                        <div>
                          <LocalizedClientLink
                            href={slide.button_link}
                            className="text-xs xsmall:text-sm small:typography-button inline-flex items-center justify-center px-4 py-2 small:px-6 small:py-3 bg-white text-grey-90 rounded-md hover:bg-grey-10 transition-all duration-200 hover:shadow-lg active:scale-95 whitespace-nowrap"
                          >
                            {slide.button_text}
                          </LocalizedClientLink>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
          className="absolute left-2 xsmall:left-3 small:left-4 top-1/2 -translate-y-1/2 z-20 bg-grey-0/70 hover:bg-grey-0 text-grey-90 p-1.5 xsmall:p-2 small:p-3 rounded-full transition-all duration-200 hover:shadow-lg active:scale-95"
          aria-label="Previous slide"
        >
          <svg
            className="w-4 h-4 xsmall:w-5 xsmall:h-5 small:w-6 small:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Next Button */}
        <button
          onClick={goToNext}
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
          className="absolute right-2 xsmall:right-3 small:right-4 top-1/2 -translate-y-1/2 z-20 bg-grey-0/70 hover:bg-grey-0 text-grey-90 p-1.5 xsmall:p-2 small:p-3 rounded-full transition-all duration-200 hover:shadow-lg active:scale-95"
          aria-label="Next slide"
        >
          <svg
            className="w-4 h-4 xsmall:w-5 xsmall:h-5 small:w-6 small:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-2 xsmall:bottom-3 small:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 small:gap-2">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${index === currentSlide
                ? "bg-grey-0 w-6 h-1.5 xsmall:w-8 xsmall:h-2 small:w-10 small:h-2.5"
                : "bg-grey-0/50 hover:bg-grey-0/70 w-1.5 h-1.5 xsmall:w-2 xsmall:h-2 small:w-2.5 small:h-2.5"
                }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide}
            />
          ))}
        </div>

        {/* Auto-play Indicator */}
        {isAutoPlay && (
          <div className="absolute top-2 xsmall:top-3 small:top-4 right-2 xsmall:right-3 small:right-4 z-20 hidden xsmall:flex items-center gap-2 bg-grey-0/70 px-2 xsmall:px-3 py-1 rounded-full text-xs small:text-sm text-grey-90">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </section>
  )
}

