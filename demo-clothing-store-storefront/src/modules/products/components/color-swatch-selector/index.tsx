import React from "react"

interface ColorSwatchSelectorProps {
  colorOptions: Array<{
    id: string
    value: string
    label?: string
  }>
  selectedColor?: string
  onColorSelect: (colorId: string, colorValue: string) => void
  disabled?: boolean
}

const colorMap: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#10b981",
  yellow: "#fbbf24",
  purple: "#a855f7",
  pink: "#ec4899",
  orange: "#f97316",
  gray: "#6b7280",
  navy: "#1e3a8a",
  brown: "#92400e",
  beige: "#f5e6d3",
  cream: "#fffdd0",
  silver: "#c0c0c0",
  gold: "#ffd700",
}

const ColorSwatchSelector: React.FC<ColorSwatchSelectorProps> = ({
  colorOptions,
  selectedColor,
  onColorSelect,
  disabled = false,
}) => {
  const getColorHex = (colorValue: string): string => {
    const lowerValue = colorValue.toLowerCase()
    return colorMap[lowerValue] || `#${Math.floor(Math.random() * 16777215).toString(16)}`
  }

  if (!colorOptions || colorOptions.length === 0) {
    return null
  }

  return (
    <div className="pt-1">
      <div className="flex flex-wrap gap-3">
        {colorOptions.map((option) => {
          const hexColor = getColorHex(option.value)
          const isSelected = selectedColor === option.value

          return (
            <button
              key={`${option.id}_${option.value}`}
              onClick={() => onColorSelect(option.id, option.value)}
              disabled={disabled}
              className={`relative group flex flex-col items-center ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              title={option.label || option.value}
            >
              {/* Color Swatch */}
              <div
                className={`w-6 h-6 rounded-full border-2 transition-all ${isSelected ? "border-slate-900 ring-2 ring-slate-400" : "border-slate-300"
                  }`}
                style={{ backgroundColor: hexColor }}
              />

              {/* Color Name Tooltip */}
              <span className="text-xs text-slate-700 mt-2 font-medium">
                {option.label || option.value}
              </span>

              {/* Selected Checkmark */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ColorSwatchSelector
