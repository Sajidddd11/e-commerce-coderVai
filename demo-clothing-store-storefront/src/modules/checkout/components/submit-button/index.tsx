"use client"

import React from "react"
import { useFormStatus } from "react-dom"
import LoadingButton from "@modules/common/components/loading-button"
import LoadingLogo from "@modules/common/components/loading-logo"

export function SubmitButton({
  children,
  variant = "primary",
  className,
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "transparent" | "danger" | null
  className?: string
  "data-testid"?: string
}) {
  const { pending } = useFormStatus()

  return (
    <>
      {pending && (
        <>
          <div className="fixed top-0 left-0 right-0 bottom-0 z-40 bg-black/10 backdrop-blur-sm" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }} />
          <div className="fixed top-0 left-0 right-0 bottom-0 z-40 flex items-center justify-center pointer-events-none" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <LoadingLogo size="md" />
          </div>
        </>
      )}
      <LoadingButton
        size="large"
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
