"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type CentralSearchProps = {
  initialCategories?: HttpTypes.StoreProductCategory[]
}

export default function CentralSearch({
  initialCategories = [],
}: CentralSearchProps) {
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [categories] = useState<HttpTypes.StoreProductCategory[]>(
    initialCategories
  )
  const categoryRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node)
      ) {
        setShowCategoryDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      const url = selectedCategory
        ? `/store?search=${encodeURIComponent(query)}&category=${selectedCategory}`
        : `/store?search=${encodeURIComponent(query)}`
      router.push(url)
      setQuery("")
    }
  }

  const selectedCategoryName = categories.find(
    (c) => c.id === selectedCategory
  )?.name

  return (
    <div className="flex-1 flex gap-3 items-center justify-between">
      {/* Left Section: Category Dropdown + Search */}
      <div className="flex-1 flex gap-2 items-center">

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-2 bg-white rounded-lg border-2 border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-sm placeholder-slate-500"
            aria-label="Search products"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 active:text-blue-700 transition-colors duration-200 hover:bg-blue-50 rounded-md"
            aria-label="Search"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </form>
      </div>

      {/* Right Section: All Products Button */}
      <LocalizedClientLink
        href="/store"
        className="px-3 py-2 hidden small:inline bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:bg-slate-300 transition-colors text-xs small:text-sm font-medium border-2 whitespace-nowrap flex-shrink-0"
        aria-label="View all products"
      >
        <span className="hidden small:inline">Exclusive Collections</span>
      </LocalizedClientLink>
    </div>
  )
}
