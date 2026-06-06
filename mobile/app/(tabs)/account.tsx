import { useState } from "react"
import { View, ScrollView, Pressable, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { LogOut, ShoppingBag, MapPin, User, ChevronRight, Moon, Monitor, Sun } from "lucide-react-native"
import { Screen } from "@components/layout/Screen"
import { AccountSupportSection } from "@components/layout/AccountSupportSection"
import { ThemedText } from "@components/ui/ThemedText"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { useAuthStore } from "@stores/auth-store"
import { useCartStore } from "@stores/cart-store"
import { useThemeStore } from "@stores/theme-store"
import { login, signup } from "@api/customer"
import { useAppTheme } from "@hooks/useAppTheme"
import { colors as staticColors, spacing, borderRadius } from "@design/theme"

export default function AccountScreen() {
  const { colors } = useAppTheme()
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
            <View style={[styles.avatarContainer, { backgroundColor: staticColors.border }]}>
              <User size={28} color={colors.textMuted} />
            </View>
            <View style={styles.profileInfo}>
              <ThemedText variant="sectionHeading" color={colors.text} style={styles.profileName}>
                Hello, {customer.first_name || "there"}!
              </ThemedText>
              <ThemedText variant="bodySmall" color={colors.textMuted}>
                {customer.email}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.menu, { backgroundColor: staticColors.card, borderColor: staticColors.border }]}>
            <MenuRow
              icon={<ShoppingBag size={20} color={colors.primary} />}
              label="My Orders"
              onPress={() => router.push("/account/orders")}
            />
            <MenuRow
              icon={<MapPin size={20} color={colors.primary} />}
              label="Addresses"
              onPress={() => router.push("/account/addresses")}
            />
            <MenuRow
              icon={<User size={20} color={colors.primary} />}
              label="Profile"
              onPress={() => router.push("/account/profile")}
            />
            <ThemeSelectorRow />
          </View>

          <View style={styles.logoutContainer}>
            <Pressable style={[styles.logoutButton, { backgroundColor: staticColors.card, borderColor: staticColors.border }]} onPress={logout}>
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
        <ThemedText variant="sectionHeading" color={colors.text}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </ThemedText>
        <ThemedText variant="body" color={colors.textMuted} style={styles.subtitle}>
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
              <ThemedText variant="bodySmall" color={colors.primary}>
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
            <ThemedText variant="body" color={colors.textMuted}>
              {mode === "login"
                ? "New here? "
                : "Already have an account? "}
              <ThemedText variant="bodyMedium" color={colors.primary}>
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

function ThemeSelectorRow() {
  const { colors } = useAppTheme()
  const themePreference = useThemeStore((s) => s.themePreference)
  const setThemePreference = useThemeStore((s) => s.setThemePreference)

  const modes = [
    { id: "system", icon: Monitor, label: "System" },
    { id: "light", icon: Sun, label: "Light" },
    { id: "dark", icon: Moon, label: "Dark" },
  ] as const

  return (
    <View style={[styles.menuRow, { borderBottomWidth: 0, flexDirection: "column", alignItems: "flex-start", gap: spacing.sm }]}>
      <ThemedText variant="bodyMedium" color={colors.text} style={{ fontWeight: '600' }}>
        App Theme
      </ThemedText>
      <View style={{ flexDirection: "row", backgroundColor: staticColors.border, borderRadius: borderRadius.base, padding: 4, width: "100%" }}>
        {modes.map((m) => {
          const isActive = themePreference === m.id
          const Icon = m.icon
          return (
            <Pressable
              key={m.id}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 8,
                backgroundColor: isActive ? colors.card : "transparent",
                borderRadius: borderRadius.base - 4,
                shadowColor: isActive ? "#000" : "transparent",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isActive ? 0.1 : 0,
                shadowRadius: 1,
                elevation: isActive ? 1 : 0,
              }}
              onPress={() => setThemePreference(m.id)}
            >
              <Icon size={14} color={isActive ? colors.primary : colors.textMuted} />
              <ThemedText variant="bodySmall" color={isActive ? colors.text : colors.textMuted} style={{ fontWeight: isActive ? '600' : '400' }}>
                {m.label}
              </ThemedText>
            </Pressable>
          )
        })}
      </View>
    </View>
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
  const { colors } = useAppTheme()
  return (
    <Pressable style={[styles.menuRow, !isLast && { borderBottomWidth: 1, borderBottomColor: staticColors.border }]} onPress={onPress}>
      <View style={[styles.menuIconContainer, { backgroundColor: staticColors.primaryMuted }]}>{icon}</View>
      <ThemedText variant="bodyMedium" color={colors.text} style={styles.menuLabel}>
        {label}
      </ThemedText>
      <ChevronRight size={20} color={colors.textMuted} />
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
    paddingHorizontal: spacing.base,
    paddingTop: spacing["2xl"],
    paddingBottom: spacing.base,
    gap: spacing.base,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: staticColors.grey[20],
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
    backgroundColor: staticColors.grey[0],
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: staticColors.grey[20],
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: staticColors.grey[20],
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
    paddingHorizontal: spacing.base,
    marginBottom: spacing["2xl"],
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 48,
    borderRadius: borderRadius.large,
    backgroundColor: staticColors.grey[0],
    borderWidth: 1,
    borderColor: staticColors.grey[20],
  },
  forgot: { alignSelf: "flex-end" },
})
