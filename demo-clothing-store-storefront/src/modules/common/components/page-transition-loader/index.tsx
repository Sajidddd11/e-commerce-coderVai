"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import LoadingLogo from "@modules/common/components/loading-logo"

export default function PageTransitionLoader() {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const intervalRef = useRef<NodeJS.Timeout>()
  const isLoadingRef = useRef(false)
  const prevPathnameRef = useRef(pathname)
  const loaderTimeoutRef = useRef<NodeJS.Timeout>()

  // Show loader when route changes are detected
  const showLoader = () => {
    if (!isLoadingRef.current) {
      isLoadingRef.current = true
      setIsVisible(true)
      setProgress(0)

      // Lock body scroll and reset scroll position for mobile
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${window.scrollY}px`

      // Safety timeout: force hide loader after 5 seconds if no route change occurs
      if (loaderTimeoutRef.current) clearTimeout(loaderTimeoutRef.current)
      loaderTimeoutRef.current = setTimeout(() => {
        isLoadingRef.current = false
        setIsVisible(false)
        setProgress(0)

        // Unlock body scroll
        const scrollY = document.body.style.top
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.top = ''
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }, 5000)
    }
  }

  useEffect(() => {
    // Detect when a link is being clicked by listening to click events
    const handleClick = (e: MouseEvent) => {
      // Only handle left-click (button === 0)
      if (e.button !== 0) return

      // Skip double-clicks (detail === 2 means double-click)
      if (e.detail === 2) return

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

    document.addEventListener("click", handleClick)
    return () => {
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
      // Clear the safety timeout since route actually changed
      if (loaderTimeoutRef.current) clearTimeout(loaderTimeoutRef.current)

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

        // Unlock body scroll and restore position
        const scrollY = document.body.style.top
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.top = ''
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1)
        }
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
        className="fixed top-0 left-0 right-0 bottom-0 z-40 bg-black/10 backdrop-blur-sm transition-opacity duration-300 pointer-events-none"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, opacity: isVisible ? 1 : 0 }}
      />

      {/* Center Loader - Show immediately */}
      {isVisible && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-40 flex items-center justify-center pointer-events-none" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <LoadingLogo size="md" />
        </div>
      )}
    </>
  )
}
