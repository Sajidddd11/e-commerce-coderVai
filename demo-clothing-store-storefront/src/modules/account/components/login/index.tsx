import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { toast } from "@medusajs/ui"
import { useActionState, useEffect } from "react"
import { mergeGuestHistory } from "@lib/merge-guest-history"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [state, formAction] = useActionState(login, null)

  useEffect(() => {
    if (state && typeof state === 'object' && 'success' in state && state.success) {
      toast.success("Welcome back!", {
        description: "You have successfully signed in.",
      })
      // Merge guest browsing history into this customer account (fire-and-forget)
      // Reads customer_id from /store/customers/me after auth is set
      if ((state as any).customer_id) {
        mergeGuestHistory((state as any).customer_id)
      }
    }
  }, [state])

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

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Welcome back</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Sign in to access an enhanced shopping experience.
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={typeof state === 'string' ? state : null} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          Sign in
        </SubmitButton>
      </form>
      <div className="w-full flex items-center my-4">
        <div className="flex-grow border-t border-ui-border-strong"></div>
        <span className="mx-4 text-ui-fg-subtle text-small-regular">OR</span>
        <div className="flex-grow border-t border-ui-border-strong"></div>
      </div>
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-x-2 border border-ui-border-strong rounded-large px-4 py-2 text-small-semi hover:bg-ui-bg-subtle transition-colors duration-200"
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
        <span>Continue with Google</span>
      </button>
      <span className="text-center text-ui-fg-base text-small-regular mt-4">
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.FORGOT_PASSWORD_PHONE)}
          className="underline"
          data-testid="forgot-password-button"
        >
          Forgot Password?
        </button>
      </span>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          Join us
        </button>
        .
      </span>
    </div>
  )
}

export default Login

