import { useRef, useState, useCallback } from "react"
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Platform,
} from "react-native"
import { WebView, WebViewNavigation } from "react-native-webview"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { XCircle, ChevronLeft } from "lucide-react-native"
import { ThemedText } from "@components/ui/ThemedText"
import { colors, spacing } from "@design/theme"

const MEDUSA_BACKEND = process.env.EXPO_PUBLIC_MEDUSA_BACKEND_URL || ""

function isCallbackUrl(url: string): { matched: boolean; status: string } {
  try {
    // Intercept either the web storefront redirect or the mobile deep-link redirect.
    // We check the raw string because 'new URL()' parses custom schemes differently
    // (e.g. 'zahan://payment/sslcommerz' has host='payment', pathname='/sslcommerz').
    if (url.includes("/checkout/sslcommerz-callback") || url.includes("payment/sslcommerz")) {
      const parsed = new URL(url)
      const status = parsed.searchParams.get("ssl_status") || "success"
      return { matched: true, status }
    }
  } catch {}
  return { matched: false, status: "" }
}

export default function SslCommerzWebViewScreen() {
  const { url, cartId, sessionId } = useLocalSearchParams<{
    url: string
    cartId?: string
    sessionId?: string
  }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const handled = useRef(false)

  const handleNavigation = useCallback(
    (navState: WebViewNavigation) => {
      if (handled.current) return false

      const { url: navUrl } = navState
      if (!navUrl) return true

      const { matched, status } = isCallbackUrl(navUrl)

      if (matched) {
        handled.current = true

        // Extract query params from the backend callback URL
        try {
          const parsed = new URL(navUrl)
          const qs = parsed.search // e.g. ?session_id=xxx&cart_id=yyy&ssl_status=success

          // Navigate to our existing callback handler screen
          router.replace((`/payment/sslcommerz-callback${qs}` as any))
        } catch {
          router.replace((`/payment/sslcommerz-callback?ssl_status=${status}` as any))
        }

        // Returning false blocks the WebView from loading this URL
        return false
      }

      return true
    },
    [router]
  )

  const handleClose = () => {
    router.back()
  }

  if (!url) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <XCircle size={48} color={colors.error} />
        <ThemedText variant="body" color={colors.grey[60]} style={styles.msg}>
          Payment URL missing. Please go back and try again.
        </ThemedText>
        <Pressable onPress={handleClose} style={styles.backBtn}>
          <ThemedText variant="bodyMedium" color={colors.brand.teal}>
            Go Back
          </ThemedText>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header bar with close button */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={12}>
          <ChevronLeft size={24} color={colors.grey[80]} />
        </Pressable>
        <ThemedText variant="bodyMedium" color={colors.grey[80]}>
          Secure Payment
        </ThemedText>
        {/* spacer to center the title */}
        <View style={styles.headerSpacer} />
      </View>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.brand.teal} />
          <ThemedText
            variant="body"
            color={colors.grey[60]}
            style={styles.msg}
          >
            Loading payment…
          </ThemedText>
        </View>
      )}

      {error ? (
        <View style={styles.center}>
          <XCircle size={48} color={colors.error} />
          <ThemedText variant="body" color={colors.grey[60]} style={styles.msg}>
            {error}
          </ThemedText>
          <Pressable onPress={handleClose} style={styles.backBtn}>
            <ThemedText variant="bodyMedium" color={colors.brand.teal}>
              Go Back
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <WebView
          source={{ uri: decodeURIComponent(url) }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          onError={(e) => {
            setLoading(false)
            setError(
              "Failed to load payment page. Please check your connection."
            )
            console.warn("[SSL WebView] Load error:", e.nativeEvent)
          }}
          // Intercept every navigation attempt
          onShouldStartLoadWithRequest={handleNavigation}
          // Also catch navigation state changes (for POST-based redirects)
          onNavigationStateChange={(navState) => {
            handleNavigation(navState)
          }}
          // Allow mixed content and 3rd party cookies for payment gateways
          mixedContentMode="compatibility"
          thirdPartyCookiesEnabled={true}
          // Keep user agent standard so payment pages render correctly
          applicationNameForUserAgent="ZahanApp/1.0"
          // Show progress bar while loading
          startInLoadingState={false}
          // Allow file access for some payment SDKs
          allowFileAccess={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.grey[0],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
    backgroundColor: colors.grey[0],
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 36,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.grey[0],
    gap: spacing.sm,
    zIndex: 10,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.base,
  },
  msg: {
    textAlign: "center",
  },
  backBtn: {
    marginTop: spacing.sm,
  },
})
