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
    <div className="  bg-slate-50  py-1 flex items-center gap-2">
      <div className="w-full flex items-center justify-around">
        <button
          onClick={handleDecrease}
          disabled={disabled || quantity <= minQuantity}
          className="pl-2 pr-1 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
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
          className="w-12 pl-2 text-center border-0 focus:outline-none bg-transparent font-medium text-slate-900"
          aria-label="Quantity"
        />
        <button
          onClick={handleIncrease}
          disabled={disabled || quantity >= maxQuantity}
          className="pr-3 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  )
}

export default QuantitySelector
