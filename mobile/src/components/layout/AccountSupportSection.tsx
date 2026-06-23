import React from "react"
import { View, Pressable, StyleSheet, Linking } from "react-native"
import { useRouter, Href } from "expo-router"
import { FontAwesome5 } from "@expo/vector-icons"
import {
  ChevronRight,
  Mail,
  Truck,
  RotateCcw,
  Info,
  Tag,
  Lock,
  FileText,
  MessageCircle,
  Zap,
  ShieldCheck,
  RefreshCcw,
  Headphones,
  Star,
  PackageCheck,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react-native"
import { ThemedText } from "../ui/ThemedText"
import {
  socialMediaLinks,
  WHATSAPP_NUMBER,
  WHATSAPP_DEFAULT_MESSAGE,
} from "@design/constants"
import { colors, spacing, borderRadius } from "@design/theme"

type LinkRow = { label: string; href: Href; icon: React.ReactNode }

const HELP_LINKS: LinkRow[] = [
  {
    label: "Contact Us",
    href: "/static/contact",
    icon: <Mail size={16} color={colors.brand.teal} />,
  },
  {
    label: "Shipping Info",
    href: "/static/shipping-info",
    icon: <Truck size={16} color={colors.brand.teal} />,
  },
  {
    label: "Returns Policy",
    href: "/static/returns",
    icon: <RotateCcw size={16} color={colors.brand.teal} />,
  },
]

const ABOUT_LINKS: LinkRow[] = [
  {
    label: "About ZAHAN",
    href: "/static/about",
    icon: <Info size={16} color={colors.brand.teal} />,
  },
  {
    label: "Offers & Promotions",
    href: "/static/offers",
    icon: <Tag size={16} color={colors.brand.teal} />,
  },
]

const LEGAL_LINKS: LinkRow[] = [
  {
    label: "Privacy Policy",
    href: "/static/privacy-policy",
    icon: <Lock size={16} color={colors.brand.teal} />,
  },
  {
    label: "Terms of Service",
    href: "/static/terms-of-service",
    icon: <FileText size={16} color={colors.brand.teal} />,
  },
]

const WHY_SHOP_FEATURES = [
  { Icon: Zap, title: "Fast Delivery" },
  { Icon: ShieldCheck, title: "Secure Payment" },
  { Icon: RefreshCcw, title: "Easy Returns" },
  { Icon: Headphones, title: "24/7 Support" },
  { Icon: Star, title: "Quality First" },
  { Icon: PackageCheck, title: "Quick Dispatch" },
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

export function AccountSupportSection() {
  const router = useRouter()

  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.sectionHeading}>
        WHY SHOP WITH US
      </ThemedText>
      
      <View style={styles.grid}>
        {WHY_SHOP_FEATURES.map(({ Icon, title }) => (
          <View key={title} style={styles.featureCard}>
            <View style={styles.featureIconPill}>
              <Icon size={16} color={colors.brand.teal} />
            </View>
            <ThemedText style={styles.featureTitle}>
              {title}
            </ThemedText>
          </View>
        ))}
      </View>

      <ThemedText style={styles.sectionHeading}>
        HELP & SUPPORT
      </ThemedText>

      <View style={styles.card}>
        <Pressable style={[styles.row, styles.rowBorder]} onPress={openWhatsApp}>
          <View style={[styles.iconBox, { backgroundColor: "rgba(37, 211, 102, 0.12)" }]}>
            <FontAwesome5 name="whatsapp" size={18} color="#25D366" />
          </View>
          <ThemedText variant="bodyMedium" color={colors.grey[90]} style={styles.rowLabel}>
            Chat on WhatsApp
          </ThemedText>
          <ChevronRight size={16} color={colors.grey[40]} />
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

      <ThemedText style={styles.sectionHeading}>
        ABOUT
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

      <ThemedText style={styles.sectionHeading}>
        LEGAL
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
        <View style={styles.social}>
          <SocialButton
            icon={<Facebook size={20} />}
            color="#1877F2"
            onPress={() => Linking.openURL(socialMediaLinks.facebook).catch(() => {})}
          />
          <SocialButton
            icon={<Instagram size={20} />}
            color="#E1306C"
            onPress={() => Linking.openURL(socialMediaLinks.instagram).catch(() => {})}
          />
          <SocialButton
            icon={<Youtube size={20} />}
            color="#FF0000"
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
      <View style={styles.iconBox}>{link.icon}</View>
      <ThemedText variant="bodyMedium" color={colors.grey[90]} style={styles.rowLabel}>
        {link.label}
      </ThemedText>
      <ChevronRight size={16} color={colors.grey[40]} />
    </Pressable>
  )
}

function SocialButton({
  icon,
  color,
  onPress,
}: {
  icon: React.ReactNode
  color: string
  onPress: () => void
}) {
  return (
    <Pressable style={styles.socialBtn} onPress={onPress}>
      {React.cloneElement(icon as React.ReactElement, { color })}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: spacing["2xl"],
  },
  sectionHeading: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    fontSize: 12,
    fontWeight: "600",
    color: colors.grey[40],
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  featureCard: {
    width: "31.5%",
    backgroundColor: colors.grey[0],
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.grey[20],
    padding: 12,
    alignItems: "center",
    gap: 8,
  },
  featureIconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(86, 174, 191, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    color: colors.grey[90],
    lineHeight: 14,
  },
  card: {
    backgroundColor: colors.grey[0],
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.grey[20],
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(86, 174, 191, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontWeight: "500", fontSize: 14 },
  socialCard: {
    alignItems: "center",
    marginVertical: spacing.sm,
  },
  social: {
    flexDirection: "row",
    gap: spacing.md,
  },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.grey[10],
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    textAlign: "center",
    marginBottom: spacing.lg,
  },
})
