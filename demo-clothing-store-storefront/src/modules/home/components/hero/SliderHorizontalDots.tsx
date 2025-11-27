"use client"
import { useState } from "react"

const SliderHorizontalDots = ({ images }: { images: string[] }) => {
  const [index, setIndex] = useState(0)

  // Handle slider navigation
  const nextSlide = () => {
    setIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevSlide = () => {
    setIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  return (
    <div className="relative w-full min-h-[250px] h-full overflow-hidden rounded-md">
      {/* Left Arrow Button */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-transparent text-white p-3 rounded-full border border-white opacity-70 hover:opacity-100 z-20"
      >
        &lt;
      </button>

      {/* Right Arrow Button */}
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent text-white p-3 rounded-full border border-white opacity-70 hover:opacity-100 z-20"
      >
        &gt;
      </button>

      {/* Slides */}
      <div
        className="flex transition-transform duration-500 h-full"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
          <div key={i} className="w-full flex-shrink-0">
            <img
              src={img} // Add your actual image src here
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-2 w-full flex justify-center gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full ${
              index === i ? "bg-white" : "bg-gray-400"
            }`}
          ></button>
        ))}
      </div>
    </div>
  )
}

export default SliderHorizontalDots
