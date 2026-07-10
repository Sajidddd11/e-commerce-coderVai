"use client"

import { useActionState, useEffect, useState, useRef } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup, requestPhoneOtp, verifyPhoneOtp, signupWithPhone } from "@lib/data/customer"
import { toast } from "@medusajs/ui"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  // Switch between email and phone signup methods
  const [signupMethod, setSignupMethod] = useState<"email" | "phone">("email")

  // Email signup state
  const [state, formAction] = useActionState(signup, null)

  // Phone signup states
  const [step, setStep] = useState<"input_phone" | "verify_otp" | "enter_details">("input_phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (state && typeof state === 'object' && 'success' in state && state.success) {
      toast.success("Welcome!", {
        description: "Your account has been successfully created.",
      })
    }
  }, [state])

  useEffect(() => {
    if (step === "verify_otp" && signupMethod === "phone") {
      otpInputRefs.current[0]?.focus()
    }
  }, [step, signupMethod])

  const handleGoogleLogin = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("google_login_origin", "web")
      }
      const res = await fetch(`${backendUrl}/auth/customer/google`)
      const { location } = await res.json()
      if (location) {
        window.location.href = location
      }
    } catch (e) {
      console.error("Google authentication failed to initiate:", e)
    }
  }

  // Phone OTP methods
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) {
      setPhoneError("Mobile number is required.")
      return
    }

    let normalizedPhone = phone.replace(/[\s\-\(\)]/g, "")
    if (normalizedPhone.startsWith("+")) {
      normalizedPhone = normalizedPhone.substring(1)
    }

    if (!/^(88)?01[3-9]\d{8}$/.test(normalizedPhone)) {
      setPhoneError("Please enter a valid Bangladeshi mobile number.")
      return
    }

    setPhoneError(null)
    setPhoneLoading(true)

    try {
      const res = await requestPhoneOtp(normalizedPhone)
      if (res.success) {
        toast.success("Verification Code Sent", {
          description: `A 6-digit OTP code was sent to ${normalizedPhone}`,
        })
        setPhone(normalizedPhone)
        setStep("verify_otp")
      } else {
        setPhoneError(res.message || "Failed to send verification code. Please try again.")
      }
    } catch (err: any) {
      setPhoneError(err.toString())
    } finally {
      setPhoneLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setPhoneError(null)

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      setPhoneError("Please enter the 6-digit code.")
      return
    }

    setPhoneError(null)
    setPhoneLoading(true)

    try {
      const res = await verifyPhoneOtp(phone, otpCode)
      if (res.success) {
        if (res.exists) {
          toast.error("Account Already Exists", {
            description: "This mobile number is already registered. Please sign in instead.",
          })
          setCurrentView(LOGIN_VIEW.SIGN_IN)
        } else {
          setStep("enter_details")
        }
      } else {
        setPhoneError(res.message || "Incorrect or expired OTP code.")
        setOtp(["", "", "", "", "", ""])
      }
    } catch (err: any) {
      setPhoneError(err.toString())
    } finally {
      setPhoneLoading(false)
    }
  }

  const handlePhoneRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !password) {
      setPhoneError("First name, last name, and password are required.")
      return
    }

    setPhoneError(null)
    setPhoneLoading(true)

    try {
      const res = await signupWithPhone({
        phone,
        otp: otp.join(""),
        first_name: firstName,
        last_name: lastName,
        password,
      })

      if (res.success) {
        toast.success("Welcome to ZAHAN!", {
          description: "Your account was successfully registered.",
        })
        window.location.reload()
      } else {
        setPhoneError(res.error || "Failed to complete account registration.")
      }
    } catch (err: any) {
      setPhoneError(err.toString())
    } finally {
      setPhoneLoading(false)
    }
  }

  return (
    <div
      className="max-w-sm flex flex-col items-center w-full"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        Become a ZAHAN Store Member
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Create your ZAHAN Store Member profile, and get access to an enhanced
        shopping experience.
      </p>

      {/* Unified Signup Method Shifter/Tabs */}
      <div className="flex w-full border-b border-ui-border-base mb-6">
        <button
          type="button"
          onClick={() => setSignupMethod("email")}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-all ${
            signupMethod === "email" ? "border-black text-black" : "border-transparent text-gray-400"
          }`}
        >
          Email Signup
        </button>
        <button
          type="button"
          onClick={() => setSignupMethod("phone")}
          className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-all ${
            signupMethod === "phone" ? "border-black text-black" : "border-transparent text-gray-400"
          }`}
        >
          Mobile OTP Signup
        </button>
      </div>

      {signupMethod === "email" ? (
        /* ================= EMAIL SIGNUP FORM ================= */
        <form className="w-full flex flex-col" action={formAction}>
          <div className="flex flex-col w-full gap-y-2">
            <Input
              label="First name *"
              name="first_name"
              required
              autoComplete="given-name"
              data-testid="first-name-input"
            />
            <Input
              label="Last name *"
              name="last_name"
              required
              autoComplete="family-name"
              data-testid="last-name-input"
            />
            <Input
              label="Email *"
              name="email"
              required
              type="email"
              autoComplete="email"
              data-testid="email-input"
            />
            <Input
              label="Phone *"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              data-testid="phone-input"
            />
            <Input
              label="Password *"
              name="password"
              required
              type="password"
              autoComplete="new-password"
              data-testid="password-input"
            />
          </div>
          <ErrorMessage error={typeof state === 'string' ? state : null} data-testid="register-error" />
          
          <span className="text-center text-ui-fg-base text-small-regular mt-6">
            By creating an account, you agree to ZAHAN Store&apos;s{" "}
            <LocalizedClientLink
              href="/content/privacy-policy"
              className="underline"
            >
              Privacy Policy
            </LocalizedClientLink>{" "}
            and{" "}
            <LocalizedClientLink
              href="/content/terms-of-use"
              className="underline"
            >
              Terms of Use
            </LocalizedClientLink>
            .
          </span>
          <SubmitButton className="w-full mt-6" data-testid="register-button">
            Join
          </SubmitButton>
        </form>
      ) : (
        /* ================= PHONE OTP SIGNUP FORM ================= */
        <div className="w-full flex flex-col">
          {step === "input_phone" && (
            <form onSubmit={handleSendOtp} className="w-full flex flex-col">
              <p className="text-center text-sm text-gray-500 mb-6">
                We will send a 6-digit verification code to confirm your number.
              </p>
              <div className="flex flex-col w-full gap-y-2">
                <Input
                  label="Mobile Number *"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <ErrorMessage error={phoneError} />
              <SubmitButton className="w-full mt-6">
                {phoneLoading ? "Sending Code..." : "Send Verification Code"}
              </SubmitButton>
            </form>
          )}

          {step === "verify_otp" && (
            <form onSubmit={handleVerifyOtp} className="w-full flex flex-col">
              <p className="text-center text-sm text-gray-500 mb-6">
                Enter the code sent to <strong>***{phone.slice(-4)}</strong>.
              </p>
              <div className="flex gap-2 justify-center mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl border border-ui-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-[#56aebf]"
                  />
                ))}
              </div>
              <ErrorMessage error={phoneError} />
              <SubmitButton className="w-full mt-6">
                {phoneLoading ? "Verifying..." : "Verify OTP"}
              </SubmitButton>
              <button
                type="button"
                onClick={() => setStep("input_phone")}
                className="text-center text-small-regular text-ui-fg-base underline mt-6"
              >
                Change Phone Number
              </button>
            </form>
          )}

          {step === "enter_details" && (
            <form onSubmit={handlePhoneRegister} className="w-full flex flex-col">
              <p className="text-center text-sm text-gray-500 mb-6">
                Create a password and name for your new mobile account.
              </p>
              <div className="flex flex-col w-full gap-y-2">
                <Input
                  label="First name *"
                  name="first_name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  label="Last name *"
                  name="last_name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                <Input
                  label="Password *"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <ErrorMessage error={phoneError} />
              <SubmitButton className="w-full mt-6">
                {phoneLoading ? "Registering..." : "Complete Registration"}
              </SubmitButton>
            </form>
          )}
        </div>
      )}

      {/* Google login option */}
      <div className="w-full flex items-center my-4">
        <div className="flex-grow border-t border-ui-border-strong"></div>
        <span className="mx-4 text-ui-fg-subtle text-small-regular">OR</span>
        <div className="flex-grow border-t border-ui-border-strong"></div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-x-2 border border-ui-border-strong rounded-large px-4 py-2 text-small-semi hover:bg-ui-bg-subtle transition-colors duration-200 mb-6"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"
          />
          <path
            fill="#FBBC05"
            d="M1.24 6.65A11.968 11.968 0 0 0 0 12c0 1.92.454 3.73 1.24 5.35l4.026-3.115a6.967 6.967 0 0 1 0-4.47L1.24 6.65z"
          />
          <path
            fill="#34A853"
            d="M5.266 14.235a7.077 7.077 0 0 1-4.026 3.115C3.198 21.302 7.27 24 12 24c3.155 0 6.009-1.077 8.218-2.918l-3.89-3.082a6.974 6.974 0 0 1-9.062-3.765z"
          />
          <path
            fill="#4285F4"
            d="M20.218 21.082C22.564 19.127 24 15.845 24 12c0-.855-.077-1.68-.218-2.482H12v4.691h6.764a5.79 5.79 0 0 1-2.51 3.79l3.964 3.083z"
          />
        </svg>
        Continue with Google
      </button>

      <span className="text-center text-ui-fg-base text-small-regular">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register
