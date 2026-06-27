import { useState } from "react"
import { View, ScrollView, Pressable, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { LogOut, ShoppingBag, MapPin, User, ChevronRight } from "lucide-react-native"
import { CoinIcon } from "@components/ui/CoinIcon"
import { Screen } from "@components/layout/Screen"
import { AccountSupportSection } from "@components/layout/AccountSupportSection"
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <User size={28} color={colors.grey[40]} />
            </View>
            <View style={styles.profileInfo}>
              <ThemedText variant="sectionHeading" color={colors.grey[90]} style={styles.profileName}>
                Hello, {customer.first_name || "there"}!
              </ThemedText>
              <ThemedText variant="bodySmall" color={colors.grey[50]}>
                {customer.email}
              </ThemedText>
            </View>
          </View>

          <View style={styles.menu}>
            <MenuRow
              icon={<ShoppingBag size={20} color={colors.brand.teal} />}
              label="My Orders"
              onPress={() => router.push("/account/orders")}
            />
            <MenuRow
              icon={<MapPin size={20} color={colors.brand.teal} />}
              label="Addresses"
              onPress={() => router.push("/account/addresses")}
            />
            <MenuRow
              icon={<CoinIcon size={20} />}
              label="Zahan Coins"
              onPress={() => router.push("/account/coins")}
            />
            <MenuRow
              icon={<User size={20} color={colors.brand.teal} />}
              label="Profile"
              onPress={() => router.push("/account/profile")}
              isLast
            />
          </View>

          <View style={styles.logoutContainer}>
            <Pressable style={styles.logoutButton} onPress={logout}>
              <LogOut size={16} color={colors.error} />
              <ThemedText variant="bodyMedium" color={colors.error} style={{ fontWeight: '600' }}>
                Log Out
              </ThemedText>
            </Pressable>
          </View>

          <AccountSupportSection />
        </ScrollView>
      </Screen>
    )
  }

  return (
    <Screen>
      <ScrollView
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.container}>
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
      </View>
      <AccountSupportSection />
      </ScrollView>
    </Screen>
  )
}

function MenuRow({
  icon,
  label,
  onPress,
  isLast,
}: {
  icon: React.ReactNode
  label: string
  onPress?: () => void
  isLast?: boolean
}) {
  return (
    <Pressable style={[styles.menuRow, !isLast && styles.menuRowBorder]} onPress={onPress}>
      <View style={styles.menuIconContainer}>{icon}</View>
      <ThemedText variant="bodyMedium" color={colors.grey[90]} style={styles.menuLabel}>
        {label}
      </ThemedText>
      <ChevronRight size={20} color={colors.grey[40]} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing["2xl"],
  },
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing["2xl"],
    paddingBottom: spacing.base,
    gap: spacing.base,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.grey[20],
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  menu: {
    backgroundColor: colors.grey[0],
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.grey[20],
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.rounded,
    backgroundColor: "rgba(86, 174, 191, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontWeight: '600' },
  logoutContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing["2xl"],
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 48,
    borderRadius: borderRadius.large,
    backgroundColor: colors.grey[0],
    borderWidth: 1,
    borderColor: colors.grey[20],
  },
  forgot: { alignSelf: "flex-end" },
})
