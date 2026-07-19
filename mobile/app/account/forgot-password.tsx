import { useState } from "react"
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import {
  requestPasswordReset,
  verifyOTP,
  resetPassword,
} from "@api/password-reset"
import { colors, spacing } from "@design/theme"

type Step = "email" | "otp" | "reset" | "done"

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  const sendCode = async () => {
    setError(null)
    setLoading(true)
    const res = await requestPasswordReset(email.trim())
    setLoading(false)
    if (res.error) {
      setError(res.error)
      return
    }
    setPhone(res.phone ?? "")
    setStep("otp")
  }

  const verify = async () => {
    setError(null)
    if (otp.trim().length < 4) {
      setError("Enter the code sent to your phone.")
      return
    }
    setLoading(true)
    const res = await verifyOTP(phone, otp.trim())
    setLoading(false)
    if (res.error) {
      setError(res.error)
      return
    }
    setResetToken(res.resetToken ?? "")
    setStep("reset")
  }

  const submitReset = async () => {
    setError(null)
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }
    setLoading(true)
    const err = await resetPassword(resetToken, password)
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    setStep("done")
  }

  return (
    <Screen edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <ChevronLeft size={24} color={colors.grey[90]} />
        </Pressable>
        <ThemedText variant="sectionHeading" color={colors.grey[90]}>
          Reset password
        </ThemedText>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {step === "email" ? (
            <>
              <ThemedText variant="body" color={colors.grey[60]}>
                Enter your account email. We&apos;ll send a verification code to
                the phone number on file.
              </ThemedText>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Button title="Send code" fullWidth loading={loading} onPress={sendCode} />
            </>
          ) : null}

          {step === "otp" ? (
            <>
              <ThemedText variant="body" color={colors.grey[60]}>
                Enter the 6-digit code sent to {phone || "your phone"}.
              </ThemedText>
              <Input
                label="Verification code"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Button title="Verify code" fullWidth loading={loading} onPress={verify} />
              <Pressable onPress={sendCode} style={styles.resend}>
                <ThemedText variant="bodySmall" color={colors.brand.teal}>
                  Resend code
                </ThemedText>
              </Pressable>
            </>
          ) : null}

          {step === "reset" ? (
            <>
              <ThemedText variant="body" color={colors.grey[60]}>
                Choose a new password (at least 8 characters).
              </ThemedText>
              <Input label="New password" value={password} onChangeText={setPassword} secureTextEntry />
              <Input label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry />
              <Button title="Update password" fullWidth loading={loading} onPress={submitReset} />
            </>
          ) : null}

          {step === "done" ? (
            <View style={styles.done}>
              <ThemedText variant="sectionHeading" color={colors.grey[90]}>
                Password updated
              </ThemedText>
              <ThemedText variant="body" color={colors.grey[60]}>
                You can now sign in with your new password.
              </ThemedText>
              <Button title="Back to sign in" fullWidth onPress={() => router.replace("/(tabs)/account")} />
            </View>
          ) : null}

          {error ? (
            <ThemedText variant="bodySmall" color={colors.error}>
              {error}
            </ThemedText>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  back: { padding: spacing.xs },
  body: { padding: spacing.base, gap: spacing.base },
  resend: { alignItems: "center", paddingVertical: spacing.sm },
  done: { gap: spacing.base, alignItems: "center", paddingVertical: spacing.xl },
})
