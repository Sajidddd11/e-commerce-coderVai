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
import { useAuthStore } from "@stores/auth-store"
import { updateCustomer } from "@api/customer"
import { colors, spacing } from "@design/theme"

export default function ProfileScreen() {
  const router = useRouter()
  const customer = useAuthStore((s) => s.customer)
  const setCustomer = useAuthStore((s) => s.setCustomer)

  const [firstName, setFirstName] = useState(customer?.first_name ?? "")
  const [lastName, setLastName] = useState(customer?.last_name ?? "")
  const [phone, setPhone] = useState(customer?.phone ?? "")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(
    null
  )

  const save = async () => {
    setSaving(true)
    setMessage(null)
    const res = await updateCustomer({
      first_name: firstName,
      last_name: lastName,
      phone,
    })
    if (res.success) {
      if (res.customer) setCustomer(res.customer)
      setMessage({ text: "Profile updated.", error: false })
    } else {
      setMessage({ text: res.error ?? "Could not update profile.", error: true })
    }
    setSaving(false)
  }

  return (
    <Screen edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <ChevronLeft size={24} color={colors.grey[90]} />
        </Pressable>
        <ThemedText variant="sectionHeading" color={colors.grey[90]}>
          Profile
        </ThemedText>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Input label="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
          <Input label="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
          <Input
            label="Email"
            value={customer?.email ?? ""}
            editable={false}
            selectTextOnFocus={false}
          />
          <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          {message ? (
            <ThemedText
              variant="bodySmall"
              color={message.error ? colors.error : colors.success}
            >
              {message.text}
            </ThemedText>
          ) : null}

          <Button title="Save changes" fullWidth loading={saving} onPress={save} style={styles.save} />
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
  form: { padding: spacing.base, gap: spacing.base },
  save: { marginTop: spacing.sm },
})
