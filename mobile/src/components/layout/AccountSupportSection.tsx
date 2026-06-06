import { View, Pressable, StyleSheet, Linking } from "react-native"
import { useRouter, Href } from "expo-router"
import { FontAwesome5 } from "@expo/vector-icons"
import {
  ChevronRight,
  HelpCircle,
  FileText,
  Truck,
  RotateCcw,
  Tag,
  Shield,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react-native"
import { ThemedText } from "../ui/ThemedText"
import { TrustSection } from "../home/TrustSection"
import { CTASection } from "../home/CTASection"
import {
  socialMediaLinks,
  WHATSAPP_NUMBER,
  WHATSAPP_DEFAULT_MESSAGE,
} from "@design/constants"
import { colors, spacing, borderRadius } from "@design/theme"

type LinkRow = { label: string; href: Href; icon: React.ReactNode }

const HELP_LINKS: LinkRow[] = [
  {
    label: "Contact us",
    href: "/static/contact",
    icon: <HelpCircle size={20} color={colors.grey[60]} />,
  },
  {
    label: "Shipping information",
    href: "/static/shipping-info",
    icon: <Truck size={20} color={colors.grey[60]} />,
  },
  {
    label: "Returns & refunds",
    href: "/static/returns",
    icon: <RotateCcw size={20} color={colors.grey[60]} />,
  },
]

const ABOUT_LINKS: LinkRow[] = [
  {
    label: "About ZAHAN",
    href: "/static/about",
    icon: <FileText size={20} color={colors.grey[60]} />,
  },
  {
    label: "Offers & promotions",
    href: "/static/offers",
    icon: <Tag size={20} color={colors.grey[60]} />,
  },
]

const LEGAL_LINKS: LinkRow[] = [
  {
    label: "Privacy policy",
    href: "/static/privacy-policy",
    icon: <Shield size={20} color={colors.grey[60]} />,
  },
  {
    label: "Terms of service",
    href: "/static/terms-of-service",
    icon: <FileText size={20} color={colors.grey[60]} />,
  },
]

function openWhatsApp() {
  const number = process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || WHATSAPP_NUMBER
  const text = encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)
  const appUrl = `whatsapp://send?phone=${number}&text=${text}`
  const webUrl = `https://wa.me/${number}?text=${text}`
  Linking.canOpenURL(appUrl)
    .then((ok) => Linking.openURL(ok ? appUrl : webUrl))
    .catch(() => Linking.openURL(webUrl))
}

/** Native-style help, policies, and social links — belongs on Account, not a web footer. */
export function AccountSupportSection() {
  const router = useRouter()

  return (
    <View style={styles.wrap}>
      <ThemedText variant="subheading" color={colors.grey[80]} style={styles.sectionHeading}>
        Why shop with us
      </ThemedText>
      <TrustSection embedded />

      <ThemedText variant="subheading" color={colors.grey[80]} style={styles.sectionHeading}>
        Join the community
      </ThemedText>
      <CTASection embedded />

      <ThemedText variant="subheading" color={colors.grey[80]} style={styles.sectionHeading}>
        Help & support
      </ThemedText>

      <View style={styles.card}>
        <Pressable style={styles.whatsappRow} onPress={openWhatsApp}>
          <View style={styles.whatsappIcon}>
            <FontAwesome5 name="whatsapp" size={22} color={colors.grey[0]} />
          </View>
          <View style={styles.rowBody}>
            <ThemedText variant="bodyMedium" color={colors.grey[90]}>
              Chat on WhatsApp
            </ThemedText>
            <ThemedText variant="bodySmall" color={colors.grey[50]}>
              Fast help with orders & delivery
            </ThemedText>
          </View>
          <ChevronRight size={18} color={colors.grey[40]} />
        </Pressable>

        {HELP_LINKS.map((link, i) => (
          <SupportRow
            key={link.label}
            link={link}
            onPress={() => router.push(link.href)}
            isLast={i === HELP_LINKS.length - 1}
          />
        ))}
      </View>

      <ThemedText variant="subheading" color={colors.grey[80]} style={styles.heading}>
        About
      </ThemedText>
      <View style={styles.card}>
        {ABOUT_LINKS.map((link, i) => (
          <SupportRow
            key={link.label}
            link={link}
            onPress={() => router.push(link.href)}
            isLast={i === ABOUT_LINKS.length - 1}
          />
        ))}
      </View>

      <ThemedText variant="subheading" color={colors.grey[80]} style={styles.heading}>
        Legal
      </ThemedText>
      <View style={styles.card}>
        {LEGAL_LINKS.map((link, i) => (
          <SupportRow
            key={link.label}
            link={link}
            onPress={() => router.push(link.href)}
            isLast={i === LEGAL_LINKS.length - 1}
          />
        ))}
      </View>

      <View style={styles.socialCard}>
        <ThemedText variant="bodySmall" color={colors.grey[50]} style={styles.follow}>
          Follow us
        </ThemedText>
        <View style={styles.social}>
          <SocialButton
            icon={<Facebook size={20} color={colors.grey[70]} />}
            onPress={() => Linking.openURL(socialMediaLinks.facebook).catch(() => {})}
          />
          <SocialButton
            icon={<Instagram size={20} color={colors.grey[70]} />}
            onPress={() => Linking.openURL(socialMediaLinks.instagram).catch(() => {})}
          />
          <SocialButton
            icon={<Youtube size={20} color={colors.grey[70]} />}
            onPress={() => Linking.openURL(socialMediaLinks.youtube).catch(() => {})}
          />
        </View>
      </View>

      <ThemedText variant="bodySmall" color={colors.grey[40]} style={styles.copy}>
        © {new Date().getFullYear()} ZAHAN Fashion and Lifestyle
      </ThemedText>
    </View>
  )
}

function SupportRow({
  link,
  onPress,
  isLast,
}: {
  link: LinkRow
  onPress: () => void
  isLast?: boolean
}) {
  return (
    <Pressable
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={onPress}
    >
      {link.icon}
      <ThemedText variant="body" color={colors.grey[90]} style={styles.rowLabel}>
        {link.label}
      </ThemedText>
      <ChevronRight size={18} color={colors.grey[40]} />
    </Pressable>
  )
}

function SocialButton({
  icon,
  onPress,
}: {
  icon: React.ReactNode
  onPress: () => void
}) {
  return (
    <Pressable style={styles.socialBtn} onPress={onPress}>
      {icon}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing["2xl"],
    gap: spacing.sm,
  },
  sectionHeading: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  heading: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.grey[0],
    borderRadius: borderRadius.rounded,
    borderWidth: 1,
    borderColor: colors.grey[20],
    overflow: "hidden",
  },
  whatsappRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.base,
    backgroundColor: colors.brand.tealMuted,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  whatsappIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.circle,
    backgroundColor: "#25D366",
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1, gap: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[10],
  },
  rowLabel: { flex: 1 },
  socialCard: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.base,
  },
  follow: { textAlign: "center" },
  social: {
    flexDirection: "row",
    gap: spacing.md,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.grey[10],
    borderWidth: 1,
    borderColor: colors.grey[20],
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    textAlign: "center",
    marginTop: spacing.sm,
  },
})
