import { View, Pressable, StyleSheet, Linking } from "react-native"
import { useRouter, Href } from "expo-router"
import { Facebook, Instagram, Youtube } from "lucide-react-native"
import { ThemedText } from "../ui/ThemedText"
import { socialMediaLinks } from "@design/constants"
import { colors, spacing } from "@design/theme"

const LINKS: { label: string; href: Href }[] = [
  { label: "About Us", href: "/static/about" },
  { label: "Contact", href: "/static/contact" },
  { label: "Offers", href: "/static/offers" },
  { label: "Returns", href: "/static/returns" },
  { label: "Shipping Info", href: "/static/shipping-info" },
  { label: "Privacy Policy", href: "/static/privacy-policy" },
  { label: "Terms of Service", href: "/static/terms-of-service" },
]

export function Footer() {
  const router = useRouter()

  return (
    <View style={styles.wrap}>
      <ThemedText variant="brand" color={colors.brand.teal} style={styles.logo}>
        ZAHAN
      </ThemedText>
      <ThemedText variant="bodySmall" color={colors.grey[40]}>
        Fashion & Lifestyle
      </ThemedText>

      <View style={styles.links}>
        {LINKS.map((l) => (
          <Pressable key={l.label} onPress={() => router.push(l.href)}>
            <ThemedText variant="footer" color={colors.grey[20]}>
              {l.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={styles.social}>
        <Pressable onPress={() => Linking.openURL(socialMediaLinks.facebook).catch(() => {})}>
          <Facebook size={22} color={colors.grey[20]} />
        </Pressable>
        <Pressable onPress={() => Linking.openURL(socialMediaLinks.instagram).catch(() => {})}>
          <Instagram size={22} color={colors.grey[20]} />
        </Pressable>
        <Pressable onPress={() => Linking.openURL(socialMediaLinks.youtube).catch(() => {})}>
          <Youtube size={22} color={colors.grey[20]} />
        </Pressable>
      </View>

      <ThemedText variant="footer" color={colors.grey[50]} style={styles.copy}>
        © {new Date().getFullYear()} ZAHAN. All rights reserved.
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.dark.bg,
    padding: spacing.xl,
    gap: spacing.sm,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  logo: { letterSpacing: 2 },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.base,
    marginTop: spacing.base,
  },
  social: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.base,
  },
  copy: { marginTop: spacing.base },
})
