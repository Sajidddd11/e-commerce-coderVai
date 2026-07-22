import { View, Pressable, StyleSheet, Linking, Alert } from "react-native"
import { useRouter } from "expo-router"
import { FontAwesome5 } from "@expo/vector-icons"
import { ChevronLeft, Mail, ShieldAlert } from "lucide-react-native"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { Button } from "@components/ui/Button"
import { useAuthStore } from "@stores/auth-store"
import { WHATSAPP_NUMBER } from "@design/constants"
import { colors, spacing, borderRadius } from "@design/theme"

export default function DeleteAccountScreen() {
  const router = useRouter()
  const customer = useAuthStore((s) => s.customer)

  const handleEmailRequest = () => {
    const email = "support@zahan.com.bd"
    const subject = encodeURIComponent("Account Deletion Request")
    const body = encodeURIComponent(
      `Hello ZAHAN Support Team,\n\nI would like to request the permanent deletion of my account and all associated data.\n\nAccount Details:\n- Email/Phone: ${customer?.email || customer?.phone || "N/A"}\n- Name: ${customer?.first_name || ""} ${customer?.last_name || ""}\n\nPlease confirm once my data has been deleted.`
    )
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert(
        "Contact Support",
        "Please send an email to support@zahan.com.bd to request account deletion."
      )
    })
  }

  const handleWhatsAppRequest = () => {
    const message = encodeURIComponent(
      `Hello ZAHAN Support, I want to request account deletion for my account (${customer?.email || customer?.phone || "my mobile number"}).`
    )
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`).catch(() => {})
  }

  return (
    <Screen edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <ChevronLeft size={24} color={colors.grey[90]} />
        </Pressable>
        <ThemedText variant="sectionHeading" color={colors.grey[90]}>
          Delete Account
        </ThemedText>
      </View>

      <View style={styles.body}>
        <View style={styles.warningBox}>
          <ShieldAlert size={28} color={colors.error} />
          <View style={styles.warningText}>
            <ThemedText variant="bodyMedium" color={colors.error} style={styles.bold}>
              Account Deletion Information
            </ThemedText>
            <ThemedText variant="bodySmall" color={colors.grey[70]}>
              Deleting your account is permanent. All saved addresses, order history, profile details, and reward points will be removed.
            </ThemedText>
          </View>
        </View>

        <ThemedText variant="body" color={colors.grey[70]}>
          To process your request safely, our support team will verify your identity before permanently deleting your account data.
        </ThemedText>

        <View style={styles.actions}>
          <Button
            title="Request Deletion via Email"
            fullWidth
            onPress={handleEmailRequest}
            leftIcon={<Mail size={18} color={colors.grey[0]} />}
            style={styles.deleteBtn}
          />

          <Button
            title="Request via WhatsApp"
            variant="secondary"
            fullWidth
            onPress={handleWhatsAppRequest}
            leftIcon={<FontAwesome5 name="whatsapp" size={18} color="#25D366" />}
          />
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
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
  body: { padding: spacing.base, gap: spacing.lg },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: borderRadius.rounded,
    padding: spacing.base,
  },
  warningText: { flex: 1, gap: 4 },
  bold: { fontWeight: "600" },
  actions: { gap: spacing.md, marginTop: spacing.md },
  deleteBtn: {
    backgroundColor: colors.error,
  },
})
