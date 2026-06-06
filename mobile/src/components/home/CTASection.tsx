import { View, StyleSheet, Linking } from "react-native"
import { Facebook } from "lucide-react-native"
import { ThemedText } from "../ui/ThemedText"
import { Button } from "../ui/Button"
import { socialMediaLinks } from "@design/constants"
import { colors, spacing, borderRadius } from "@design/theme"

export function CTASection() {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <ThemedText variant="sectionHeading" color={colors.grey[0]}>
          Join the ZAHAN community
        </ThemedText>
        <ThemedText variant="body" color={colors.grey[20]} style={styles.text}>
          Follow us for new drops, exclusive offers, and styling inspiration.
        </ThemedText>
        <Button
          title="Follow on Facebook"
          variant="brand"
          leftIcon={<Facebook size={18} color={colors.grey[0]} />}
          onPress={() => Linking.openURL(socialMediaLinks.facebook).catch(() => {})}
          style={styles.cta}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.base },
  card: {
    backgroundColor: colors.dark.bg,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  text: { marginBottom: spacing.sm },
  cta: { marginTop: spacing.xs },
})
