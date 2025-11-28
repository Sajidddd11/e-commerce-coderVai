"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import DotSpinner from "@modules/common/components/dot-spinner"

export default function PageTransitionLoader() {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const intervalRef = useRef<NodeJS.Timeout>()
  const isLoadingRef = useRef(false)
  const prevPathnameRef = useRef(pathname)

  useEffect(() => {
    // Detect when a link is being clicked by listening to click events
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")

      // Check if it's an internal link (not external, not same page)
      if (
        link &&
        (link instanceof HTMLAnchorElement) &&
        link.href &&
        !link.href.startsWith("#") &&
        link.target !== "_blank" &&
        link.getAttribute("data-no-loader") !== "true"
      ) {
        const currentOrigin = window.location.origin
        const linkOrigin = new URL(link.href, currentOrigin).origin

        if (linkOrigin === currentOrigin) {
          const linkPathname = new URL(link.href, currentOrigin).pathname
          if (linkPathname !== pathname) {
            // Different page - show loader
            if (!isLoadingRef.current) {
              isLoadingRef.current = true
              setIsVisible(true)
              setProgress(0)

              // Auto-hide after 2.5 seconds if route hasn't changed yet
              if (timeoutRef.current) clearTimeout(timeoutRef.current)
              timeoutRef.current = setTimeout(() => {
                isLoadingRef.current = false
                setIsVisible(false)
                setProgress(0)
              }, 2500)
            }
          }
        }
      }
    }

    document.addEventListener("mousedown", handleMouseDown)
    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [pathname])

  // Animate progress bar
  useEffect(() => {
    if (isVisible) {
      if (intervalRef.current) clearInterval(intervalRef.current)

      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 30
        })
      }, 100)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isVisible])

  // Handle route completion
  useEffect(() => {
    if (isLoadingRef.current && pathname !== prevPathnameRef.current) {
      // Route has actually changed
      prevPathnameRef.current = pathname
      setProgress(100)

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        isLoadingRef.current = false
        setIsVisible(false)
        setProgress(0)
      }, 400)
    }
  }, [pathname])

  if (!isVisible && progress === 0) return null

  return (
    <>
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-black origin-left transition-transform duration-300 ease-out"
        style={{
          transform: `scaleX(${progress / 100})`,
          opacity: isVisible ? 1 : 0,
        }}
      />

      {/* Page Overlay - Subtle dimming */}
      <div
        className={`fixed inset-0 z-40 bg-black/5 transition-opacity duration-300 pointer-events-none ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Center Loader - Appears after short delay */}
      {isVisible && progress > 30 && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-4">
            {/* Dot Spinner */}
            <DotSpinner size="lg" color="#262626" />

            {/* Loading Text */}
            <p className="text-sm font-medium text-grey-80">
              Loading...
            </p>
          </div>
        </div>
      )}
    </>
  )
}