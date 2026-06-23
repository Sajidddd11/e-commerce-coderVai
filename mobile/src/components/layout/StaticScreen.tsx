import { View, ScrollView, Pressable, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { Screen } from "./Screen"
import { ThemedText } from "../ui/ThemedText"
import { colors, spacing } from "@design/theme"

interface Block {
  heading?: string
  body?: string
}

interface StaticScreenProps {
  title: string
  intro?: string
  blocks: Block[]
  variant?: "light" | "dark"
}

export function StaticScreen({
  title,
  intro,
  blocks,
  variant = "light",
}: StaticScreenProps) {
  const router = useRouter()
  const dark = variant === "dark"
  const bg = dark ? colors.dark.bg : colors.grey[0]
  const titleColor = dark ? colors.grey[0] : colors.grey[90]
  const headingColor = dark ? colors.brand.teal : colors.grey[90]
  const bodyColor = dark ? colors.grey[20] : colors.grey[60]

  return (
    <Screen edges={["top"]} background={bg}>
      <View style={[styles.header, dark && styles.headerDark]}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <ChevronLeft size={24} color={titleColor} />
        </Pressable>
        <ThemedText variant="sectionHeading" color={titleColor}>
          {title}
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {intro ? (
          <ThemedText variant="body" color={bodyColor} style={styles.intro}>
            {intro}
          </ThemedText>
        ) : null}

        {blocks.map((block, i) => (
          <View key={i} style={styles.block}>
            {block.heading ? (
              <ThemedText variant="subheading" color={headingColor}>
                {block.heading}
              </ThemedText>
            ) : null}
            {block.body ? (
              <ThemedText variant="body" color={bodyColor}>
                {block.body}
              </ThemedText>
            ) : null}
          </View>
        ))}
      </ScrollView>
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
  headerDark: {
    borderBottomColor: colors.dark.border,
  },
  back: { padding: spacing.xs },
  scroll: { padding: spacing.base, gap: spacing.lg, paddingBottom: spacing["2xl"] },
  intro: {},
  block: { gap: spacing.xs },
})
