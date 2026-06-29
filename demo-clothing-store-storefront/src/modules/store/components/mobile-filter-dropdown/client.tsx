"use client"

import { useState, useEffect } from "react"
import FilterPanelClient from "../filter-panel/filter-panel-client"
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

  // Prevent scroll when mobile filter is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return (
    <div className="small:hidden mb-6">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-3 bg-white border border-grey-20 rounded-lg flex items-center justify-between hover:bg-grey-5 transition-colors shadow-sm"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-slate-800 text-sm">Filters & Sort</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Adjust options</span>
          <svg
            className="w-4 h-4 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </div>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-Up Bottom Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 px-6 pb-8 pt-4 shadow-2xl transition-all duration-300 ease-out transform max-h-[85vh] overflow-y-auto ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Drawer Pull Tab */}
        <div className="w-12 h-1.5 bg-grey-20 rounded-full mx-auto mb-6" />

        {/* Close Button Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Filters & Sorting</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-grey-10 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Filter Content */}
        <div className="pb-8">
          <FilterPanelClient categories={categories} />
        </div>
      </div>
    </div>
  )
}

export default MobileFilterDropdownClient
