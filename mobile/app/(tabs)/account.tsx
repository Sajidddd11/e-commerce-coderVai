import { useState } from "react"
import { View, ScrollView, Pressable, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { LogOut, Package, MapPin, UserCog, ChevronRight } from "lucide-react-native"
import { Screen } from "@components/layout/Screen"
import { Footer } from "@components/layout/Footer"
import { ThemedText } from "@components/ui/ThemedText"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { useAuthStore } from "@stores/auth-store"
import { useCartStore } from "@stores/cart-store"
import { login, signup } from "@api/customer"
import { colors, spacing, borderRadius } from "@design/theme"

export default function AccountScreen() {
  const router = useRouter()
  const customer = useAuthStore((s) => s.customer)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const loadCustomer = useAuthStore((s) => s.load)
  const logout = useAuthStore((s) => s.logout)
  const refreshCart = useCartStore((s) => s.refresh)

  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const result =
        mode === "login"
          ? await login({ email, password })
          : await signup({
              email,
              password,
              first_name: firstName,
              last_name: lastName,
              phone,
            })

      if (!result.success) {
        setError(result.error ?? "Something went wrong")
        return
      }

      await Promise.all([loadCustomer(), refreshCart()])
    } finally {
      setSubmitting(false)
    }
  }

  if (isAuthenticated && customer) {
    return (
      <Screen>
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.profileHeader}>
              <ThemedText variant="sectionHeading" color={colors.grey[90]}>
                Hello, {customer.first_name || "there"}
              </ThemedText>
              <ThemedText variant="body" color={colors.grey[50]}>
                {customer.email}
              </ThemedText>
            </View>

            <View style={styles.menu}>
              <MenuRow
                icon={<Package size={20} color={colors.grey[70]} />}
                label="Orders"
                onPress={() => router.push("/account/orders")}
              />
              <MenuRow
                icon={<MapPin size={20} color={colors.grey[70]} />}
                label="Addresses"
                onPress={() => router.push("/account/addresses")}
              />
              <MenuRow
                icon={<UserCog size={20} color={colors.grey[70]} />}
                label="Profile"
                onPress={() => router.push("/account/profile")}
              />
            </View>

            <Button
              title="Log out"
              variant="secondary"
              leftIcon={<LogOut size={18} color={colors.slate[900]} />}
              onPress={logout}
              style={styles.logout}
            />
          </View>

          <Footer />
        </ScrollView>
      </Screen>
    )
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText variant="sectionHeading" color={colors.grey[90]}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </ThemedText>
        <ThemedText variant="body" color={colors.grey[50]} style={styles.subtitle}>
          {mode === "login"
            ? "Sign in to access your orders and addresses."
            : "Join ZAHAN for faster checkout and order tracking."}
        </ThemedText>

        <View style={styles.form}>
          {mode === "register" ? (
            <>
              <Input
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              <Input
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
              <Input
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </>
          ) : null}

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? (
            <ThemedText variant="bodySmall" color={colors.error}>
              {error}
            </ThemedText>
          ) : null}

          {mode === "login" ? (
            <Pressable
              onPress={() => router.push("/account/forgot-password")}
              style={styles.forgot}
            >
              <ThemedText variant="bodySmall" color={colors.brand.teal}>
                Forgot password?
              </ThemedText>
            </Pressable>
          ) : null}

          <Button
            title={mode === "login" ? "Sign in" : "Create account"}
            fullWidth
            loading={submitting}
            onPress={submit}
            style={styles.submit}
          />

          <Pressable
            onPress={() => {
              setError(null)
              setMode(mode === "login" ? "register" : "login")
            }}
            style={styles.toggle}
          >
            <ThemedText variant="body" color={colors.grey[60]}>
              {mode === "login"
                ? "New here? "
                : "Already have an account? "}
              <ThemedText variant="bodyMedium" color={colors.brand.teal}>
                {mode === "login" ? "Create one" : "Sign in"}
              </ThemedText>
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  )
}

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode
  label: string
  onPress?: () => void
}) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      {icon}
      <ThemedText variant="body" color={colors.grey[90]} style={styles.menuLabel}>
        {label}
      </ThemedText>
      <ChevronRight size={18} color={colors.grey[40]} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.base,
    gap: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.base,
  },
  form: {
    gap: spacing.base,
  },
  submit: {
    marginTop: spacing.sm,
  },
  toggle: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  profileHeader: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  menu: {
    backgroundColor: colors.grey[0],
    borderRadius: borderRadius.rounded,
    borderWidth: 1,
    borderColor: colors.grey[20],
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[10],
  },
  menuLabel: { flex: 1 },
  forgot: { alignSelf: "flex-end" },
  logout: {
    marginTop: spacing.lg,
  },
})
