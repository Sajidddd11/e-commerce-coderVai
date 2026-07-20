"use client"

import React from "react"
import { createPortal } from "react-dom"
import { useFormStatus } from "react-dom"
import LoadingButton from "@modules/common/components/loading-button"
import LoadingLogo from "@modules/common/components/loading-logo"

export function SubmitButton({
  children,
  variant = "primary",
  size = "large",
  className,
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "transparent" | "danger" | null
  size?: "small" | "base" | "large"
  className?: string
  "data-testid"?: string
}) {
  const { pending } = useFormStatus()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {pending && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm pointer-events-none">
          <LoadingLogo size="lg" />
        </div>,
        document.body
      )}
      <LoadingButton
        size={size}
        className={className}
        type="submit"
        isLoading={false}
        variant={variant || "primary"}
        data-testid={dataTestId}
      >
        {children}
      </LoadingButton>
    </>
  )
}
