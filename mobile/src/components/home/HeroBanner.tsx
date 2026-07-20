import { StyleSheet, View } from "react-native"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { colors, spacing, borderRadius } from "@design/theme"
import { ThemedText } from "../ui/ThemedText"
import { Button } from "../ui/Button"

export function HeroBanner() {
  const router = useRouter()

  return (
    <View style={styles.wrap}>
      <View style={styles.banner}>
        <Image 
          source="https://images.unsplash.com/photo-1603189343302-e603f7add05a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxuZXclMjBzZWFzb24lMjBmYXNoaW9uJTIwY29sbGVjdGlvbiUyMGVkaXRvcmlhbHxlbnwxfDB8fHwxNzgwNzMyNDc3fDA&ixlib=rb-4.1.0&q=80&w=600"
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <View style={styles.overlay} />
        
        <View style={styles.content}>
          <ThemedText variant="bodySmall" color={colors.brand.teal} style={styles.subtitle}>
            2026 COLLECTION
          </ThemedText>
          <ThemedText variant="sectionHeading" color={colors.grey[0]} style={styles.title}>
            New Season{"\n"}Arrivals
          </ThemedText>
          <ThemedText variant="bodySmall" color="rgba(255,255,255,0.7)" style={styles.desc}>
            Fashion & Lifestyle
          </ThemedText>
          <Button
            title="Shop the collection"
            variant="brand"
            size="small"
            style={styles.cta}
            onPress={() => router.push("/(tabs)/shop")}
          />
        </View>
        
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.base,
  },
  banner: {
    backgroundColor: colors.slate[900],
    borderRadius: borderRadius.large,
    height: 176, // h-44
    overflow: "hidden",
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
  },
  content: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: spacing.base, // px-6
    paddingVertical: 20, // py-5
    justifyContent: "center",
    alignItems: "flex-start",
  },
  subtitle: {
    letterSpacing: 3.2,
    fontWeight: "500",
    textTransform: "uppercase",
    fontSize: 10,
    marginBottom: 4, // mb-1
  },
  title: {
    fontWeight: "700",
    lineHeight: 32,
    fontSize: 24, // text-2xl
    marginBottom: 4, // mb-1
  },
  desc: {
    marginBottom: 16, // mb-4
  },
  cta: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
  },
  dots: {
    position: "absolute",
    bottom: 12, // bottom-3
    alignSelf: "center",
    flexDirection: "row",
    gap: 6, // gap-1.5
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: {
    width: 16,
    backgroundColor: colors.brand.teal,
  },
})
