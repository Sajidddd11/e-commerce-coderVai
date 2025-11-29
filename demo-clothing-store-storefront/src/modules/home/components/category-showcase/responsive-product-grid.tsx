"use client"

import { HttpTypes } from "@medusajs/types"
import ProductCardWithPrice from "./product-card"
import { useEffect, useState } from "react"

interface ResponsiveProductGridProps {
  products: HttpTypes.StoreProduct[]
}

export default function ResponsiveProductGrid({
  products,
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
        {products.slice(0, 10).map((product) => (
          <ProductCardWithPrice key={product.id} product={product} />
        ))}
      </div>
    )
  }

  const displayProducts = isSmallScreen ? products.slice(0, 8) : products.slice(0, 10)

  return (
    <div className="grid gap-3 small:gap-4 grid-cols-2 xsmall:grid-cols-2 small:grid-cols-4">
      {displayProducts.map((product) => (
        <ProductCardWithPrice key={product.id} product={product} />
      ))}
    </div>
  )
}
