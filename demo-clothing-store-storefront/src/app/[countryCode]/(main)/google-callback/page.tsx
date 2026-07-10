"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { loginOrRegisterWithGoogle, registerWithGoogleDetails } from "@lib/data/customer"

function GoogleCallbackHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [requiresInfo, setRequiresInfo] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    authIdentityId: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
  })

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
        
        const loginResult = await loginOrRegisterWithGoogle(token)
        
        // Determine if login was initiated from web or mobile
        let isMobile = true
        if (typeof window !== "undefined") {
          const origin = window.sessionStorage.getItem("google_login_origin")
          if (origin === "web") {
            isMobile = false
            window.sessionStorage.removeItem("google_login_origin")
          }
        }

        // Prevent deep-link redirects on desktop browsers
        const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : ""
        const isDesktop = !/iphone|ipad|ipod|android/i.test(ua)

        // Handle case where user profile is incomplete (requires Name/Phone)
        if (loginResult.requiresInfo) {
          if (isMobile && !isDesktop) {
            const redirectUrl = `zahan://auth-callback?requiresInfo=true&email=${encodeURIComponent(loginResult.email || "")}&firstName=${encodeURIComponent(loginResult.firstName || "")}&lastName=${encodeURIComponent(loginResult.lastName || "")}&authIdentityId=${encodeURIComponent(loginResult.authIdentityId || "")}`
            window.location.href = redirectUrl
          } else {
            setFormData({
              authIdentityId: loginResult.authIdentityId || "",
              email: loginResult.email || "",
              first_name: loginResult.firstName || "",
              last_name: loginResult.lastName || "",
              phone: loginResult.phone || "",
            })
            setRequiresInfo(true)
          }
          return
        }

        if (!loginResult.success || !loginResult.token) {
          throw new Error(loginResult.error || "Failed to set session or create customer record.")
        }

        if (isMobile && !isDesktop) {
          window.location.href = `zahan://auth-callback?token=${encodeURIComponent(loginResult.token)}`
        } else {
          router.replace("/account")
        }
      })
      .catch((err) => {
        setError(err.message || "An unexpected error occurred.")
      })
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.first_name || !formData.phone) {
      setError("Name and Phone Number are required fields.")
      return
    }

    setSubmitting(true)
    setError(null)

    const result = await registerWithGoogleDetails(formData)
    if (result.success) {
      router.replace("/account")
    } else {
      setError(result.error || "Failed to complete profile registration.")
      setSubmitting(false)
    }
  }

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

  if (requiresInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="w-full max-w-md bg-white border border-gray-100 shadow-2xl rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Complete Your Profile</h1>
            <p className="text-sm text-gray-500">Just a couple details needed to finalize your account setup.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                id="first_name"
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                id="last_name"
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
              <input
                id="phone"
                type="tel"
                required
                placeholder="e.g. 01XXXXXXXXX"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:bg-gray-300 disabled:shadow-none flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Complete Registration</span>
              )}
            </button>
          </form>
        </div>
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
