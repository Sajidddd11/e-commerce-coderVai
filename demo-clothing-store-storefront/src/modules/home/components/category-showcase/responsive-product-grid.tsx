"use client"

import { HttpTypes } from "@medusajs/types"
import ProductCardWithPrice from "./product-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useEffect, useState } from "react"

interface ResponsiveProductGridProps {
  products: HttpTypes.StoreProduct[]
  categoryHandle?: string
}

export default function ResponsiveProductGrid({
  products,
  categoryHandle,
}: ResponsiveProductGridProps) {
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!isMounted) {
    return (
      <div className="grid gap-3 small:gap-4 grid-cols-2 xsmall:grid-cols-2 small:grid-cols-4">
        {products.slice(0, 7).map((product) => (
          <ProductCardWithPrice key={product.id} product={product} />
        ))}
        {categoryHandle && (
          <SeeAllCard categoryHandle={categoryHandle} />
        )}
      </div>
    )
  }

  const displayProducts = products.slice(0, 7)

  return (
    <div className="grid gap-3 small:gap-4 grid-cols-2 xsmall:grid-cols-2 small:grid-cols-4">
      {displayProducts.map((product) => (
        <ProductCardWithPrice key={product.id} product={product} />
      ))}
      {categoryHandle && (
        <SeeAllCard categoryHandle={categoryHandle} />
      )}
    </div>
  )
}

function SeeAllCard({ categoryHandle }: { categoryHandle: string }) {
  return (
    <LocalizedClientLink
      href={`/categories/${categoryHandle}`}
      className="group relative rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center min-h-full"
      style={{
      }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:opacity-30 transition-opacity duration-300 text-center px-4">
        <h3 className="text-sm small:text-base font-bold text-gray-900 mb-1">
          See All
        </h3>
        <p className="text-xs text-gray-600">
          View Collection
        </p>
      </div>

      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="text-center">
          <p className="text-white font-semibold text-sm small:text-base">
            See All Products
          </p>
          <p className="text-white/80 text-xs mt-1">
            →
          </p>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
