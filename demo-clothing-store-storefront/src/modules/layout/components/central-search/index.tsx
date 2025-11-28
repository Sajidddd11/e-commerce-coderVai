"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

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

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId)
    setShowCategoryDropdown(false)
  }

  const selectedCategoryName = categories.find(
    (c) => c.id === selectedCategory
  )?.name

  return (
    <div className="flex-1 flex gap-2 items-center">
      {/* Category Filter Dropdown */}
      <div className="relative" ref={categoryRef}>
        <button
          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:bg-slate-300 transition-colors text-xs small:text-sm font-medium border border-slate-200 flex items-center gap-1 whitespace-nowrap"
          aria-label="Filter by category"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <span className="hidden small:inline truncate max-w-[150px]">
            {selectedCategoryName || "Category"}
          </span>
        </button>

        {/* Category Dropdown Menu */}
        {showCategoryDropdown && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-40 w-56 max-h-80 overflow-y-auto">
            <div className="p-2">
              <button
                onClick={() => handleCategorySelect("")}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                  !selectedCategory
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm truncate ${
                    selectedCategory === category.id
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                  title={category.name}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

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
  )
}