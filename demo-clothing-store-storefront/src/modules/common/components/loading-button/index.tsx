"use client"

import React from "react"
import { Button, clx } from "@medusajs/ui"
import DotSpinner from "@modules/common/components/dot-spinner"

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  variant?: "primary" | "secondary" | "danger" | "transparent"
  size?: "small" | "base" | "large"
  children: React.ReactNode
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export default function LoadingButton({
  isLoading = false,
  variant = "primary",
  size = "base",
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  const isDisabled = disabled || isLoading

  // Clean styling for large primary buttons
  const enhancedLargePrimary = variant === "primary" && size === "large"

  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      disabled={isDisabled}
      className={clx(
        "relative",
        enhancedLargePrimary && [
          "w-full",
          "py-4",
          "text-base font-semibold",
        ],
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <DotSpinner size="sm" color="currentColor" />
          <span>{children}</span>
        </div>
      ) : (
        children
      )}
    </Button>
  )
}
