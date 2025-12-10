"use client"

import { useState } from "react"
import RefinementListClient from "../refinement-list/refinement-list-client"
import { SortOptions } from "../refinement-list/sort-products"
import { HttpTypes } from "@medusajs/types"

const MobileFilterDropdownClient = ({
  sortBy,
  categories,
}: {
  sortBy: SortOptions
  categories: HttpTypes.StoreProductCategory[]
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="small:hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border border-grey-20 rounded-lg flex items-center justify-between hover:bg-grey-5 transition-colors"
        aria-expanded={isOpen}
        aria-controls="mobile-filters-panel"
      >
        <span className="font-semibold text-grey-90">Filters</span>
        <svg
          className={`w-5 h-5 text-grey-70 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          id="mobile-filters-panel"
          className="mt-3 p-4 bg-white border border-grey-20 rounded-lg animate-fade-in-top"
        >
          <RefinementListClient sortBy={sortBy} categories={categories} />
        </div>
      )}
    </div>
  )
}

export default MobileFilterDropdownClient
