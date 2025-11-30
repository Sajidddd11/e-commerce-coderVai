import { useState } from "react"
import Input from "@modules/common/components/input"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import ErrorMessage from "@modules/checkout/components/error-message"

type Props = {
    requestPasswordReset: (email: string) => Promise<{ error: string | null; phone?: string }>
    onSuccess: (phone: string) => void
    onCancel: () => void
}

const ForgotPasswordPhone = ({ requestPasswordReset, onSuccess, onCancel }: Props) => {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const result = await requestPasswordReset(email)

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else if (result.phone) {
            setLoading(false)
            onSuccess(result.phone) // Pass the phone number from server, not the email!
        } else {
            setError("Failed to get phone number from server")
            setLoading(false)
        }
    }

    return (
        <div
            className="max-w-sm w-full flex flex-col items-center"
            data-testid="forgot-password-phone-page"
        >
            <h1 className="text-large-semi uppercase mb-6">Forgot Password</h1>
            <p className="text-center text-base-regular text-ui-fg-base mb-8">
                Enter your email to receive an OTP code via SMS
            </p>
            <form className="w-full" onSubmit={handleSubmit}>
                <div className="flex flex-col w-full gap-y-2">
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        data-testid="email-input"
                        autoComplete="email"
                    />
                </div>
                <ErrorMessage error={error} data-testid="forgot-password-error" />
                <SubmitButton
                    data-testid="send-otp-button"
                    className="w-full mt-6"
                >
                    {loading ? "Sending..." : "Send OTP"}
                </SubmitButton>
            </form>
            <button
                onClick={onCancel}
                className="text-center text-ui-fg-base text-small-regular mt-6 underline"
                data-testid="cancel-button"
            >
                Back to Login
            </button>
        </div>
    )
}

export default ForgotPasswordPhone
