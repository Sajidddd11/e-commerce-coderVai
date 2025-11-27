"use client"
import { useEffect, useState } from "react"

const SliderAutoplay = ({
  images,
  interval = 6000,
}: {
  images: string[]
  interval?: number
}) => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, interval)
    return () => clearInterval(id)
  }, [images.length, interval])

  return (
    <div className="relative w-full h-full overflow-hidden rounded-md">
      <div
        className="flex h-full transition-transform duration-500"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ))}
      </div>
    </div>
  )
}

export default SliderAutoplay
