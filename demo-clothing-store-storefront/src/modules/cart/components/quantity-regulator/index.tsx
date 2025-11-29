"use client"

import { clx } from "@medusajs/ui"
import MinusIcon from "@modules/common/icons/minus"
import PlusIcon from "@modules/common/icons/plus"

interface QuantityRegulatorProps {
  quantity: number
  onChange: (quantity: number) => void
  maxQuantity?: number
  minQuantity?: number
  disabled?: boolean
  "data-testid"?: string
}

const QuantityRegulator = ({
  quantity,
  onChange,
  maxQuantity = 10,
  minQuantity = 1,
  disabled = false,
  "data-testid": dataTestid,
}: QuantityRegulatorProps) => {
  const handleDecrease = () => {
    if (quantity > minQuantity && !disabled) {
      onChange(quantity - 1)
    }
  }

  const handleIncrease = () => {
    if (quantity < maxQuantity && !disabled) {
      onChange(quantity + 1)
    }
  }

  const canDecrease = quantity > minQuantity && !disabled
  const canIncrease = quantity < maxQuantity && !disabled

  return (
    <div className="flex items-center gap-2" data-testid={dataTestid}>
      <button
        onClick={handleDecrease}
        disabled={!canDecrease}
        className={clx(
          "flex items-center justify-center w-8 h-8 rounded border transition-all duration-200",
          {
            "border-ui-border-base bg-ui-bg-base text-ui-fg-base hover:bg-ui-bg-base-hover cursor-pointer":
              canDecrease,
            "border-ui-border-disabled bg-ui-bg-disabled text-ui-fg-disabled cursor-not-allowed":
              !canDecrease,
          }
        )}
        aria-label="Decrease quantity"
      >
        <MinusIcon />
      </button>

      <span className="w-8 text-center font-medium text-ui-fg-base txt-small">
        {quantity}
      </span>

      <button
        onClick={handleIncrease}
        disabled={!canIncrease}
        className={clx(
          "flex items-center justify-center w-8 h-8 rounded border transition-all duration-200",
          {
            "border-ui-border-base bg-ui-bg-base text-ui-fg-base hover:bg-ui-bg-base-hover cursor-pointer":
              canIncrease,
            "border-ui-border-disabled bg-ui-bg-disabled text-ui-fg-disabled cursor-not-allowed":
              !canIncrease,
          }
        )}
        aria-label="Increase quantity"
      >
        <PlusIcon />
      </button>
    </div>
  )
}

export default QuantityRegulator
