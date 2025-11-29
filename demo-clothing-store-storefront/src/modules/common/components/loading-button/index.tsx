"use client"

import React from "react"
import { Button } from "@medusajs/ui"
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
  ...props
}: LoadingButtonProps) {
  const isDisabled = disabled || isLoading

  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      disabled={isDisabled}
      className="relative"
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
