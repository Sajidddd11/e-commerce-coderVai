"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { setGoogleAuthToken } from "@lib/data/customer"

function GoogleCallbackHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code) {
      setError("No authorization code received.")
      return
    }

    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    
    // Exchange OAuth code for a JWT token from the Medusa backend
    fetch(`${backendUrl}/auth/customer/google/callback?code=${code}&state=${state}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to exchange authentication code.")
        return res.json()
      })
      .then(async ({ token }) => {
        if (!token) throw new Error("No token returned from authentication server.")
        
        await setGoogleAuthToken(token)

        // If login was initiated by the mobile app, redirect to deep link
        if (state === "mobile") {
          window.location.href = `zahan://auth-callback?token=${encodeURIComponent(token)}`
        } else {
          router.replace("/account")
        }
      })
      .catch((err) => {
        setError(err.message || "An unexpected error occurred.")
      })
  }, [searchParams, router])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <h1 className="text-xl font-semibold text-red-600 mb-2">Authentication Failed</h1>
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={() => router.replace("/account")} className="underline text-teal-600">
          Return to sign in
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
      <p className="text-gray-500">Signing in with Google...</p>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <GoogleCallbackHandler />
    </Suspense>
  )
}
