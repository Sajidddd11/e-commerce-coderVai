"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"

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

    // Swipe left - next image
    if (diff > 50) {
      setSelectedImageIndex((prev) => (prev + 1) % images.length)
    }

    // Swipe right - previous image
    if (diff < -50) {
      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-slate-200 rounded-lg flex items-center justify-center">
        <p className="text-slate-500">No images available</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image with Zoom */}
      <div
        ref={mainImageRef}
        className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-zoom-in group"
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
          className={`object-cover transition-transform duration-300 ${
            isZooming ? "scale-150" : "scale-100"
          }`}
          style={
            isZooming
              ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }
              : {}
          }
        />

        {/* Zoom Indicator - Desktop Only */}
        {isZooming && (
          <div className="hidden small:flex absolute top-4 right-4 bg-black/50 text-white px-3 py-2 rounded text-sm">
            🔍 Zoom
          </div>
        )}

        {/* Image Counter - Mobile */}
        <div className="small:hidden absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-xs font-medium">
          {selectedImageIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 small:w-20 small:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImageIndex === index
                  ? "border-slate-900"
                  : "border-slate-300 hover:border-slate-500"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Mobile Swipe Instructions */}
      {images.length > 1 && (
        <p className="small:hidden text-center text-xs text-slate-500 mt-2">
          Swipe left or right to view more images
        </p>
      )}
    </div>
  )
}

export default ImageGallery
