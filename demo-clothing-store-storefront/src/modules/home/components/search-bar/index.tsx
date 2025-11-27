"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/store?search=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-md mx-auto mt-8"
    >
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products..."
          className="w-full px-5 py-3 small:py-4 pr-12 bg-white rounded-lg border-2 border-slate-200 focus:outline-none focus:border-slate-400 transition-colors duration-300 text-slate-900 placeholder-slate-500"
          aria-label="Search products"
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Search"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
      <p className="text-white/80 text-sm mt-3 text-center">
        Try searching for "clothing", "accessories", or any product name
      </p>
    </form>
  )
}
