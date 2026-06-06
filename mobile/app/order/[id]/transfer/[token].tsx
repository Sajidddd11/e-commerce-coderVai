import { useState } from "react"
import { View, StyleSheet } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ArrowLeftRight, CheckCircle2, XCircle } from "lucide-react-native"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { Button } from "@components/ui/Button"
import { acceptTransferRequest, declineTransferRequest } from "@api/orders"
import { colors, spacing } from "@design/theme"

type Result = "idle" | "accepted" | "declined" | "error"

export default function OrderTransferScreen() {
  const { id, token } = useLocalSearchParams<{ id: string; token: string }>()
  const router = useRouter()
  const [result, setResult] = useState<Result>("idle")
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const accept = async () => {
    setLoading("accept")
    setError(null)
    const res = await acceptTransferRequest(id, token)
    setLoading(null)
    if (res.success) setResult("accepted")
    else {
      setResult("error")
      setError(res.error ?? "Could not accept transfer.")
    }
  }

  const decline = async () => {
    setLoading("decline")
    setError(null)
    const res = await declineTransferRequest(id, token)
    setLoading(null)
    if (res.success) setResult("declined")
    else {
      setResult("error")
      setError(res.error ?? "Could not decline transfer.")
    }
  }

  return (
    <Screen>
      <View style={styles.center}>
        {result === "idle" ? (
          <>
            <ArrowLeftRight size={56} color={colors.brand.teal} />
            <ThemedText variant="sectionHeading" color={colors.grey[90]} style={styles.text}>
              Order transfer request
            </ThemedText>
            <ThemedText variant="body" color={colors.grey[60]} style={styles.text}>
              Accept this request to move the order into your account, or decline
              it.
            </ThemedText>
            <Button title="Accept transfer" fullWidth loading={loading === "accept"} onPress={accept} />
            <Button
              title="Decline"
              variant="secondary"
              fullWidth
              loading={loading === "decline"}
              onPress={decline}
            />
          </>
        ) : result === "accepted" ? (
          <>
            <CheckCircle2 size={56} color={colors.success} />
            <ThemedText variant="sectionHeading" color={colors.grey[90]} style={styles.text}>
              Transfer accepted
            </ThemedText>
            <Button title="View my orders" fullWidth onPress={() => router.replace("/account/orders")} />
          </>
        ) : result === "declined" ? (
          <>
            <XCircle size={56} color={colors.grey[50]} />
            <ThemedText variant="sectionHeading" color={colors.grey[90]} style={styles.text}>
              Transfer declined
            </ThemedText>
            <Button title="Go home" fullWidth onPress={() => router.replace("/(tabs)")} />
          </>
        ) : (
          <>
            <XCircle size={56} color={colors.error} />
            <ThemedText variant="body" color={colors.error} style={styles.text}>
              {error}
            </ThemedText>
            <Button title="Go home" fullWidth onPress={() => router.replace("/(tabs)")} />
          </>
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.base,
    padding: spacing.xl,
  },
  text: { textAlign: "center" },
})
