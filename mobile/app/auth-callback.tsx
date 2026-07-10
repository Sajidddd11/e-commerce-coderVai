import { useEffect, useState } from "react"
import { View, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useAuthStore } from "@stores/auth-store"
import { useCartStore } from "@stores/cart-store"
import { ThemedText } from "@components/ui/ThemedText"
import { setToken } from "@utils/storage"
import { colors } from "@design/theme"
import { retrieveCustomer, registerWithGoogleDetails } from "@api/customer"

export default function AuthCallbackScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const setCustomer = useAuthStore((s) => s.setCustomer)
  const refreshCart = useCartStore((s) => s.refresh)
  const [error, setError] = useState<string | null>(null)
  
  const [requiresInfo, setRequiresInfo] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [authIdentityId, setAuthIdentityId] = useState("")
  const [focusedField, setFocusedField] = useState<string | null>(null)

  useEffect(() => {
    const handleAuth = async () => {
      console.log("[AUTH-CALLBACK] Deep link params received:", params)

      if (Object.keys(params).length === 0) {
        console.log("[AUTH-CALLBACK] Empty params, waiting for next tick...")
        return
      }

      setError(null)

      // Check if this is a redirection that requires more details (name/phone)
      if (params.requiresInfo === "true") {
        setEmail((params.email as string) || "")
        setFirstName((params.firstName as string) || "")
        setLastName((params.lastName as string) || "")
        setAuthIdentityId((params.authIdentityId as string) || "")
        setRequiresInfo(true)
        return
      }

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
  }, [params.token, params.requiresInfo])

  const handleSubmit = async () => {
    if (!firstName.trim() || !phone.trim()) {
      setError("Name and Phone Number are required fields.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const result = await registerWithGoogleDetails({
        authIdentityId,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
      })

      if (result.success && result.token) {
        // Retrieve the customer profile to verify session is active
        const customer = await retrieveCustomer()
        if (customer) {
          setCustomer(customer)
          await refreshCart()
          router.replace("/(tabs)/account")
        } else {
          throw new Error("Could not retrieve customer details after registration.")
        }
      } else {
        throw new Error(result.error || "Failed to complete registration.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to register profile.")
      setSubmitting(false)
    }
  }

  if (error && !requiresInfo) {
    return (
      <View style={styles.container}>
        <ThemedText variant="sectionHeading" color={colors.error} style={styles.title}>
          Authentication Failed
        </ThemedText>
        <ThemedText variant="body" color={colors.grey[50]} style={styles.subtitle}>
          {error}
        </ThemedText>
        <TouchableOpacity style={styles.button} onPress={() => router.replace("/(tabs)/account")}>
          <ThemedText variant="button" color="#fff">Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    )
  }

  if (requiresInfo) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.grey[0] }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 8 }}>
              <ThemedText variant="sectionHeading" color={colors.grey[90]}>
                Complete Your{" "}
              </ThemedText>
              <ThemedText variant="sectionHeading" color={colors.brand.teal}>
                Profile
              </ThemedText>
            </View>
            <ThemedText variant="bodySmall" color={colors.grey[40]} style={styles.formSubtitle}>
              Please provide your name and mobile number to finish creating your ZAHAN account.
            </ThemedText>

            {error && (
              <ThemedText variant="body" color={colors.error} style={styles.errorText}>
                {error}
              </ThemedText>
            )}

            <View style={styles.inputContainer}>
              <ThemedText variant="bodySmall" color={colors.grey[60]} style={styles.label}>
                First Name *
              </ThemedText>
              <TextInput
                style={[styles.input, focusedField === "firstName" && styles.inputFocused]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor={colors.grey[30]}
                onFocus={() => setFocusedField("firstName")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText variant="bodySmall" color={colors.grey[60]} style={styles.label}>
                Last Name
              </ThemedText>
              <TextInput
                style={[styles.input, focusedField === "lastName" && styles.inputFocused]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor={colors.grey[30]}
                onFocus={() => setFocusedField("lastName")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText variant="bodySmall" color={colors.grey[60]} style={styles.label}>
                Mobile Number *
              </ThemedText>
              <TextInput
                style={[styles.input, focusedField === "phone" && styles.inputFocused]}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. 01XXXXXXXXX"
                keyboardType="phone-pad"
                placeholderTextColor={colors.grey[30]}
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText variant="button" color="#fff">
                  Complete Registration
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.grey[0],
  },
  formCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.brand.teal,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(86, 174, 191, 0.2)",
  },
  formTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  formSubtitle: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.grey[90],
    backgroundColor: colors.grey[5],
    transitionProperty: "borderColor",
    transitionDuration: "200ms",
  },
  inputFocused: {
    borderColor: colors.brand.teal,
    borderWidth: 1.5,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: colors.brand.teal,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    shadowColor: colors.brand.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: colors.grey[30],
    shadowOpacity: 0,
    elevation: 0,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
})
