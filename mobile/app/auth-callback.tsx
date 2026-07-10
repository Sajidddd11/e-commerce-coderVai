import { useEffect, useState } from "react"
import { View, StyleSheet, ActivityIndicator } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useAuthStore } from "@stores/auth-store"
import { useCartStore } from "@stores/cart-store"
import { ThemedText } from "@components/ui/ThemedText"
import { setToken } from "@utils/storage"
import { colors } from "@design/theme"

import { retrieveCustomer } from "@api/customer"

export default function AuthCallbackScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const setCustomer = useAuthStore((s) => s.setCustomer)
  const refreshCart = useCartStore((s) => s.refresh)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuth = async () => {
      const token = params.token as string

      if (!token) {
        setError("No authentication token found in deep link.")
        return
      }

      try {
        // Save the session token to storage
        await setToken(token)
        
        // Retrieve the customer profile directly to verify session is active
        const customer = await retrieveCustomer()
        
        if (!customer) {
          throw new Error("Could not load customer profile from backend. Check network or server configuration.")
        }

        // Set customer in Zustand store
        setCustomer(customer)

        // Refresh cart
        await refreshCart()

        // Redirect user to the account tab
        router.replace("/(tabs)/account")
      } catch (err: any) {
        console.error("Error setting up session from deep link:", err)
        setError(err.message || "Failed to sign in.")
      }
    }

    handleAuth()
  }, [params.token])

  if (error) {
    return (
      <View style={styles.container}>
        <ThemedText variant="sectionHeading" color={colors.error} style={styles.title}>
          Authentication Failed
        </ThemedText>
        <ThemedText variant="body" color={colors.grey[50]} style={styles.subtitle}>
          {error}
        </ThemedText>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.brand.teal} />
      <ThemedText variant="body" color={colors.grey[50]} style={styles.loadingText}>
        Completing login...
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.grey[0],
    padding: 20,
  },
  title: {
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 15,
  },
})
