"use client"

import { useState, useEffect } from "react"

const CAROUSEL_IMAGE = "https://i.ibb.co.com/3PZXtjJ/Screenshot-2025-11-27-at-12-42-52-AM.png"

export default function HomeHero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const slides = [
    CAROUSEL_IMAGE,
    CAROUSEL_IMAGE,
    CAROUSEL_IMAGE,
    CAROUSEL_IMAGE,
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
    <section className="relative w-full max-h-[370px] h-auto bg-grey-0 overflow-hidden">
      {/* Carousel Container */}
      <div className="relative w-full h-[200px] xsmall:h-[250px] small:h-[300px] medium:h-[350px] lg:h-[370px]">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide}
              alt={`Carousel slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-grey-0/70 hover:bg-grey-0 text-grey-90 p-2 small:p-3 rounded-full transition-all duration-200 hover:shadow-lg active:scale-95"
          aria-label="Previous slide"
        >
          <svg
            className="w-5 h-5 small:w-6 small:h-6"
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
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-grey-0/70 hover:bg-grey-0 text-grey-90 p-2 small:p-3 rounded-full transition-all duration-200 hover:shadow-lg active:scale-95"
          aria-label="Next slide"
        >
          <svg
            className="w-5 h-5 small:w-6 small:h-6"
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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 small:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? "bg-grey-0 w-8 h-2 small:w-10 small:h-2.5"
                  : "bg-grey-0/50 hover:bg-grey-0/70 w-2 h-2 small:w-2.5 small:h-2.5"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide}
            />
          ))}
        </div>

        {/* Auto-play Indicator */}
        {isAutoPlay && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-grey-0/70 px-3 py-1 rounded-full text-xs small:text-sm text-grey-90">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {/* <span>Auto-playing</span> */}
          </div>
        )}
      </div>
    </section>
  )
}