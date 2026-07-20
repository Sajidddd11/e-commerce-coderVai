"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import LoadingLogo from "@modules/common/components/loading-logo"

function PageTransitionLoaderInner() {
  const [isNavigating, setIsNavigating] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isLoadingRef = useRef(false)
  const overlayTimerRef = useRef<NodeJS.Timeout>()
  const loaderTimeoutRef = useRef<NodeJS.Timeout>()
  const intervalRef = useRef<NodeJS.Timeout>()
  const overlayShownTimeRef = useRef<number>(0)
  const prevPathnameRef = useRef(pathname)
  const prevSearchParamsRef = useRef(searchParams.toString())

  const unlockScroll = () => {
    const scrollY = document.body.style.top
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
    document.body.style.top = ''
    document.body.style.paddingRight = ''
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
  }

  const hideLoader = () => {
    const now = Date.now()
    const elapsedOverlayTime = overlayShownTimeRef.current ? now - overlayShownTimeRef.current : 0
    
    // Minimum Visible Duration (MVD): 400ms if overlay was shown
    const remainingMvd = overlayShownTimeRef.current 
      ? Math.max(0, 400 - elapsedOverlayTime) 
      : 0

    setTimeout(() => {
      isLoadingRef.current = false
      setIsNavigating(false)
      setShowOverlay(false)
      setProgress(0)
      overlayShownTimeRef.current = 0
      unlockScroll()
    }, remainingMvd)
  }

  const showLoader = (instantOverlay = false) => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    setIsNavigating(true)
    setProgress(15)

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    // Lock body scroll for mobile
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.top = `-${window.scrollY}px`
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    if (instantOverlay) {
      // Immediate overlay for explicit actions like Login/Logout
      overlayShownTimeRef.current = Date.now()
      setShowOverlay(true)
    } else {
      // 200ms Delay Threshold: Only show heavy frosted blur overlay if fetch takes > 200ms
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current)
      overlayTimerRef.current = setTimeout(() => {
        if (isLoadingRef.current) {
          overlayShownTimeRef.current = Date.now()
          setShowOverlay(true)
        }
      }, 200)
    }

    // Safety timeout: force hide loader after 5 seconds if no route change occurs
    if (loaderTimeoutRef.current) clearTimeout(loaderTimeoutRef.current)
    loaderTimeoutRef.current = setTimeout(() => {
      hideLoader()
    }, 5000)
  }

  // Detect link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.detail === 2) return

      const target = e.target as HTMLElement
      const link = target.closest("a")

      if (
        link &&
        link instanceof HTMLAnchorElement &&
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
            showLoader(false)
          }
        }
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [pathname])

  // Animate progress bar while navigating
  useEffect(() => {
    if (isNavigating) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 20
        })
      }, 100)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isNavigating])

  // Custom event listener for instant overlay actions (login/logout)
  useEffect(() => {
    const handleStart = () => {
      showLoader(true)
    }
    window.addEventListener("page-transition-start", handleStart)
    return () => window.removeEventListener("page-transition-start", handleStart)
  }, [])

  // Handle route completion
  useEffect(() => {
    const routeChanged = pathname !== prevPathnameRef.current || searchParams.toString() !== prevSearchParamsRef.current

    if (routeChanged) {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current)
      if (loaderTimeoutRef.current) clearTimeout(loaderTimeoutRef.current)

      prevPathnameRef.current = pathname
      prevSearchParamsRef.current = searchParams.toString()

      setProgress(100)
      hideLoader()
    }
  }, [pathname, searchParams])

  if (!isNavigating && progress === 0 && !showOverlay) return null

  return (
    <>
      {/* Top Progress Bar - Instant feedback on 0ms */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-gradient-to-r from-black via-slate-800 to-black origin-left transition-transform duration-200 ease-out"
        style={{
          transform: `scaleX(${progress / 100})`,
          opacity: isNavigating ? 1 : 0,
        }}
      />

      {/* Frosted Glass Overlay - Rendered ONLY after 200ms delay threshold with MVD */}
      <div
        className="fixed inset-0 z-40 bg-white/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-none"
        style={{ opacity: showOverlay ? 1 : 0 }}
      />

      {/* Center Animated Logo */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <LoadingLogo size="lg" />
        </div>
      )}
    </>
  )
}

export default function PageTransitionLoader() {
  return (
    <Suspense fallback={null}>
      <PageTransitionLoaderInner />
    </Suspense>
  )
}
