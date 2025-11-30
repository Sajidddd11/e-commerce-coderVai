import { useState } from "react"
import Input from "@modules/common/components/input"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import ErrorMessage from "@modules/checkout/components/error-message"

type Props = {
    resetToken: string
    resetPassword: (resetToken: string, newPassword: string) => Promise<string | null>
    onSuccess: () => void
}

const ResetPassword = ({ resetToken, resetPassword, onSuccess }: Props) => {
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        // Validate password length
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long")
            return
        }

        setLoading(true)

        const errorMessage = await resetPassword(resetToken, newPassword)

        if (errorMessage) {
            setError(errorMessage)
            setLoading(false)
        } else {
            setLoading(false)
            onSuccess()
        }
    }

    return (
        <div
            className="max-w-sm w-full flex flex-col items-center"
            data-testid="reset-password-page"
        >
            <h1 className="text-large-semi uppercase mb-6">Reset Password</h1>
            <p className="text-center text-base-regular text-ui-fg-base mb-8">
                Enter your new password
            </p>
            <form className="w-full" onSubmit={handleSubmit}>
                <div className="flex flex-col w-full gap-y-2">
                    <Input
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        data-testid="new-password-input"
                    />
                    <Input
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        data-testid="confirm-password-input"
                    />
                </div>
                <ErrorMessage error={error} data-testid="reset-password-error" />
                <SubmitButton
                    data-testid="reset-password-button"
                    className="w-full mt-6"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </SubmitButton>
            </form>
        </div>
    )
}

export default ResetPassword
