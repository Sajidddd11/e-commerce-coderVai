"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState, useRef } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [isZooming, setIsZooming] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const mainImageRef = useRef<HTMLDivElement>(null)

  const selectedImage = images[selectedImageIndex]

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return

    const rect = mainImageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setZoomPosition({ x, y })
    setIsZooming(true)
  }

  const handleMouseLeave = () => {
    setIsZooming(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX - touchEndX

    if (diff > 50) {
      setSelectedImageIndex((prev) => (prev + 1) % images.length)
    }

    if (diff < -50) {
      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-slate-200 flex items-center justify-center">
        <p className="text-slate-500">No images available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-5 gap-1 xsmall:gap-3">
      {/* Main Image with Zoom */}
      <div
        ref={mainImageRef}
        className="relative col-span-4 overflow-hidden bg-slate-100 cursor-zoom-in group mx-auto"
        style={{
          aspectRatio: "1 / 1",
          width: "100%",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={selectedImage.url}
          alt={`Product image ${selectedImageIndex + 1}`}
          fill
          priority
          sizes="(max-width: 576px) 100vw, (max-width: 768px) 90vw, (max-width: 992px) 500px, 600px"
          className={`object-cover transition-transform duration-300 ${isZooming ? "scale-150" : "scale-100"
            }`}
          style={
            isZooming
              ? {
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }
              : {}
          }
          quality={90}
        />
      </div>

      {/* Thumbnail Gallery - Horizontal Scroll */}
      {images.length > 1 && (
        <div className="flex flex-col gap-1 xsmall:gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative flex-shrink-0 w-full aspect-square small:w-16 small:h-16 rounded-lg overflow-hidden border xsmall:border-2 transition-all ${selectedImageIndex === index
                ? "border-slate-900 shadow-lg"
                : "border-slate-200 hover:border-slate-400"
                }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
