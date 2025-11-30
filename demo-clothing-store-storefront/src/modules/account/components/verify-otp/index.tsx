import { useState, useRef, useEffect } from "react"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import ErrorMessage from "@modules/checkout/components/error-message"

type Props = {
    phone: string
    verifyOTP: (phone: string, otp: string) => Promise<{ error?: string; resetToken?: string }>
    onSuccess: (resetToken: string) => void
    onResend: () => void
    onCancel: () => void
}

const VerifyOTP = ({ phone, verifyOTP, onSuccess, onResend, onCancel }: Props) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        // Focus first input on mount
        inputRefs.current[0]?.focus()
    }, [])

    const handleChange = (index: number, value: string) => {
        // Only allow digits
        if (!/^\d*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value.slice(-1) // Only take last character

        setOtp(newOtp)
        setError(null)

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Handle backspace
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }

        // Handle paste
        if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            navigator.clipboard.readText().then((text) => {
                const digits = text.replace(/\D/g, "").slice(0, 6).split("")
                const newOtp = [...otp]
                digits.forEach((digit, i) => {
                    newOtp[i] = digit
                })
                setOtp(newOtp)

                // Focus last filled input or first empty
                const lastIndex = Math.min(digits.length, 5)
                inputRefs.current[lastIndex]?.focus()
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const otpCode = otp.join("")
        if (otpCode.length !== 6) {
            setError("Please enter a 6-digit OTP code")
            return
        }

        setError(null)
        setLoading(true)

        const result = await verifyOTP(phone, otpCode)

        if (result.error) {
            setError(result.error)
            setLoading(false)
            // Clear OTP on error
            setOtp(["", "", "", "", "", ""])
            inputRefs.current[0]?.focus()
        } else if (result.resetToken) {
            setLoading(false)
            onSuccess(result.resetToken)
        }
    }

    return (
        <div
            className="max-w-sm w-full flex flex-col items-center"
            data-testid="verify-otp-page"
        >
            <h1 className="text-large-semi uppercase mb-6">Verify OTP</h1>
            <p className="text-center text-base-regular text-ui-fg-base mb-8">
                Enter the 6-digit code sent to <strong>{phone}</strong>
            </p>
            <form className="w-full" onSubmit={handleSubmit}>
                <div className="flex gap-2 justify-center mb-4">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                inputRefs.current[index] = el
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-12 text-center text-xl border border-ui-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-base"
                            data-testid={`otp-input-${index}`}
                        />
                    ))}
                </div>
                <ErrorMessage error={error} data-testid="verify-otp-error" />
                <SubmitButton
                    data-testid="verify-otp-button"
                    className="w-full mt-6"
                >
                    {loading ? "Verifying..." : "Verify OTP"}
                </SubmitButton>
            </form>
            <div className="flex gap-4 mt-6">
                <button
                    onClick={onResend}
                    className="text-small-regular text-ui-fg-base underline"
                    data-testid="resend-otp-button"
                >
                    Resend OTP
                </button>
                <span className="text-small-regular text-ui-fg-subtle">|</span>
                <button
                    onClick={onCancel}
                    className="text-small-regular text-ui-fg-base underline"
                    data-testid="cancel-verify-button"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}

export default VerifyOTP
