"use client"

import React, { useState, useEffect } from "react"
import Input from "@modules/common/components/input"

type AddressLabelSelectorProps = {
  value: string
  onChange: (value: string) => void
  name?: string
}

const AddressLabelSelector = ({ value, onChange, name = "company" }: AddressLabelSelectorProps) => {
  const [mode, setMode] = useState<"Home" | "Office" | "Custom" | "None">(() => {
    if (!value) return "None"
    if (value === "Home") return "Home"
    if (value === "Office") return "Office"
    return "Custom"
  })

  // Sync external value changes to mode if needed
  useEffect(() => {
    if (!value && mode !== "None" && mode !== "Custom") {
      setMode("None")
    } else if (value === "Home" && mode !== "Home") {
      setMode("Home")
    } else if (value === "Office" && mode !== "Office") {
      setMode("Office")
    } else if (value && value !== "Home" && value !== "Office" && mode !== "Custom") {
      setMode("Custom")
    }
  }, [value])

  const handleModeChange = (newMode: "Home" | "Office" | "Custom" | "None") => {
    setMode(newMode)
    if (newMode === "Home") {
      onChange("Home")
    } else if (newMode === "Office") {
      onChange("Office")
    } else if (newMode === "None") {
      onChange("")
    } else if (newMode === "Custom") {
      // Keep existing custom value if switching to Custom, else clear
      if (value === "Home" || value === "Office" || !value) {
        onChange("")
      }
    }
  }

  return (
    <div className="flex flex-col gap-y-2 w-full">
      <span className="text-sm text-ui-fg-base">Address Label (Optional)</span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleModeChange("None")}
          className={`px-4 py-2 text-sm border rounded-md transition-colors ${
            mode === "None" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:bg-gray-50 text-gray-700"
          }`}
        >
          None
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("Home")}
          className={`px-4 py-2 text-sm border rounded-md transition-colors ${
            mode === "Home" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:bg-gray-50 text-gray-700"
          }`}
        >
          Home
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("Office")}
          className={`px-4 py-2 text-sm border rounded-md transition-colors ${
            mode === "Office" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:bg-gray-50 text-gray-700"
          }`}
        >
          Office
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("Custom")}
          className={`px-4 py-2 text-sm border rounded-md transition-colors ${
            mode === "Custom" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:bg-gray-50 text-gray-700"
          }`}
        >
          Custom
        </button>
      </div>

      {mode === "Custom" && (
        <div className="mt-2">
          <Input
            label="Write custom label"
            name={name}
            value={value !== "Home" && value !== "Office" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            data-testid="company-custom-input"
          />
        </div>
      )}

      {/* Hidden input for native forms (like account add/edit) */}
      {mode !== "Custom" && (
        <input type="hidden" name={name} value={value} />
      )}
    </div>
  )
}

export default AddressLabelSelector
