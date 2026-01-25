"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface Slide {
  image: string
  alt: string
  link: string
}

export default function HomeHero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const slides: Slide[] = [
    {
      image: "/banners/all.png",
      alt: "Shop All Categories",
      link: "/store",
    },
    {
      image: "/banners/headphone.jpg",
      alt: "Headphones Collection",
      link: "/categories/headphones",
    },
    {
      image: "/banners/snicker.jpg",
      alt: "Sneakers Collection",
      link: "/categories/sneakers",
    },
    {
      image: "/banners/watch.jpg",
      alt: "Watches Collection",
      link: "/categories/watches",
    },
  ]

  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlay, slides.length])

  const goToPrevious = () => {
    setIsAutoPlay(false)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setIsAutoPlay(false)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlay(false)
    setCurrentSlide(index)
  }

  return (
    <section className="relative w-full bg-grey-0 overflow-hidden">
      {/* Carousel Container */}
      <div className="relative w-full h-[180px] xsmall:h-[220px] small:h-[280px] medium:h-[330px] large:h-[370px]">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={`slide-${index}`}
            className={`absolute inset-0 transition-opacity transition-2000 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${index === currentSlide
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
              }`}
          >
            <LocalizedClientLink
              href={slide.link}
              className="block w-full h-full relative"
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
                quality={85}
                priority={index === 0}
                sizes="100vw"
              />
            </LocalizedClientLink>
          </div>
        ))}

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
          {slides.map((_, index) => (
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
