import { Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { colors, spacing, borderRadius } from "@design/theme"
import { ThemedText } from "../ui/ThemedText"
import { Button } from "../ui/Button"

/**
 * Branded hero. Web uses a remote banner carousel (HERO_SLIDES); drop the
 * actual banner images into assets/banners and swap this for an image carousel.
 */
export function HeroBanner() {
  const router = useRouter()

  return (
    <View style={styles.wrap}>
      <View style={styles.banner}>
        <ThemedText variant="hero" color={colors.grey[0]}>
          ZAHAN
        </ThemedText>
        <ThemedText variant="subheading" color={colors.grey[10]}>
          Fashion & Lifestyle
        </ThemedText>
        <Button
          title="Shop the collection"
          variant="brand"
          size="base"
          style={styles.cta}
          onPress={() => router.push("/(tabs)/shop")}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  banner: {
    backgroundColor: colors.grey[90],
    borderRadius: borderRadius.large,
    padding: spacing["2xl"],
    gap: spacing.sm,
    alignItems: "flex-start",
    minHeight: 200,
    justifyContent: "center",
  },
  cta: {
    marginTop: spacing.base,
  },
})
