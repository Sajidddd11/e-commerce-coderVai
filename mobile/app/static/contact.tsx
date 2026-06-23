import { View, Pressable, StyleSheet, Linking } from "react-native"
import { useRouter } from "expo-router"
import { ChevronLeft, Phone, Mail, MessageCircle } from "lucide-react-native"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { WHATSAPP_NUMBER, socialMediaLinks } from "@design/constants"
import { colors, spacing, borderRadius } from "@design/theme"

export default function ContactScreen() {
  const router = useRouter()

  const rows = [
    {
      icon: <MessageCircle size={20} color={colors.whatsapp} />,
      label: "WhatsApp",
      value: `+${WHATSAPP_NUMBER}`,
      onPress: () => Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}`).catch(() => {}),
    },
    {
      icon: <Phone size={20} color={colors.brand.teal} />,
      label: "Call us",
      value: `+${WHATSAPP_NUMBER}`,
      onPress: () => Linking.openURL(`tel:+${WHATSAPP_NUMBER}`).catch(() => {}),
    },
    {
      icon: <Mail size={20} color={colors.brand.teal} />,
      label: "Email",
      value: "support@zahan.com.bd",
      onPress: () => Linking.openURL("mailto:support@zahan.com.bd").catch(() => {}),
    },
  ]

  return (
    <Screen edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <ChevronLeft size={24} color={colors.grey[90]} />
        </Pressable>
        <ThemedText variant="sectionHeading" color={colors.grey[90]}>
          Contact
        </ThemedText>
      </View>

      <View style={styles.body}>
        <ThemedText variant="body" color={colors.grey[60]}>
          We&apos;re here to help. Reach us through any of the channels below.
        </ThemedText>

        {rows.map((r) => (
          <Pressable key={r.label} style={styles.row} onPress={r.onPress}>
            <View style={styles.iconPill}>{r.icon}</View>
            <View>
              <ThemedText variant="bodySmall" color={colors.grey[50]}>
                {r.label}
              </ThemedText>
              <ThemedText variant="bodyMedium" color={colors.grey[90]}>
                {r.value}
              </ThemedText>
            </View>
          </Pressable>
        ))}

        <Pressable
          style={styles.row}
          onPress={() => Linking.openURL(socialMediaLinks.facebook).catch(() => {})}
        >
          <View style={styles.iconPill}>
            <MessageCircle size={20} color={colors.brand.teal} />
          </View>
          <View>
            <ThemedText variant="bodySmall" color={colors.grey[50]}>
              Facebook
            </ThemedText>
            <ThemedText variant="bodyMedium" color={colors.grey[90]}>
              facebook.com/zahan.com.bd
            </ThemedText>
          </View>
        </Pressable>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
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
  body: { padding: spacing.base, gap: spacing.base },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.grey[0],
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: borderRadius.rounded,
    padding: spacing.base,
  },
  iconPill: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.rounded,
    backgroundColor: colors.grey[10],
    alignItems: "center",
    justifyContent: "center",
  },
})
