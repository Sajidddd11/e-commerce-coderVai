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

  // Show loader when route changes are detected
  const showLoader = () => {
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
            // Different page - show loader immediately
            showLoader()
          }
        }
      }
    }

    // Also listen for clicks on any element that might trigger navigation
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Check if this is a clickable card or navigation element
      const clickableCard = target.closest('[data-clickable="true"]') ||
                           target.closest('[role="button"]') ||
                           target.closest('button')

      // Show loader for interactive elements that might navigate
      if (clickableCard && isLoadingRef.current === false) {
        // Small delay to ensure state updates are visible
        requestAnimationFrame(() => {
          showLoader()
        })
      }
    }

    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("click", handleClick)
    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("click", handleClick)
    }
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

  // Handle route completion and detect any route changes (including router.push)
  useEffect(() => {
    // Check if route actually changed
    const routeChanged = pathname !== prevPathnameRef.current

    if (routeChanged) {
      // If loader wasn't already shown by link click, show it now (for router.push cases)
      if (!isLoadingRef.current) {
        showLoader()
      }

      prevPathnameRef.current = pathname

      // Complete the loading animation
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
      {/* Top Progress Bar - More prominent */}
      <div className="fixed top-0 left-0 right-0 z-50 h-2 bg-gradient-to-r from-black via-slate-800 to-black origin-left transition-transform duration-300 ease-out"
        style={{
          transform: `scaleX(${progress / 100})`,
          opacity: isVisible ? 1 : 0,
        }}
      />

      {/* Page Overlay - More visible */}
      <div
        className={`fixed inset-0 z-40 bg-black/10 backdrop-blur-sm transition-opacity duration-300 pointer-events-none ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Center Loader - Show immediately */}
      {isVisible && (
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
