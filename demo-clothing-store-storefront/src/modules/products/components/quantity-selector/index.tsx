import React from "react"

interface QuantitySelectorProps {
  quantity: number
  onQuantityChange: (quantity: number) => void
  maxQuantity?: number
  disabled?: boolean
  minQuantity?: number
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onQuantityChange,
  maxQuantity = 999,
  minQuantity = 1,
  disabled = false,
}) => {
  const handleDecrease = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1)
    }
  }

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || minQuantity
    if (value >= minQuantity && value <= maxQuantity) {
      onQuantityChange(value)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label className="block text-sm font-medium text-slate-900">
        Quantity
      </label>
      <div className="flex items-center border border-slate-300 rounded-lg bg-white">
        <button
          onClick={handleDecrease}
          disabled={disabled || quantity <= minQuantity}
          className="px-3 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          disabled={disabled}
          min={minQuantity}
          max={maxQuantity}
          className="w-12 px-2 py-2 text-center border-0 focus:outline-none bg-transparent font-medium text-slate-900"
          aria-label="Quantity"
        />
        <button
          onClick={handleIncrease}
          disabled={disabled || quantity >= maxQuantity}
          className="px-3 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  )
}

export default QuantitySelector
