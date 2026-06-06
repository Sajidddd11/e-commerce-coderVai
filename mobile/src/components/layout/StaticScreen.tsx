import { View, ScrollView, Pressable, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { Screen } from "./Screen"
import { ThemedText } from "../ui/ThemedText"
import { spacing, colors as rawColors } from "@design/theme"
import { useAppTheme } from "@hooks/useAppTheme"

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
  const { colors } = useAppTheme();

  const router = useRouter()
  const dark = variant === "dark"
  const bg = dark ? rawColors.dark.bg : colors.background
  const titleColor = dark ? rawColors.grey[0] : colors.text
  const headingColor = dark ? colors.primary : colors.text
  const bodyColor = dark ? rawColors.dark.border : colors.textMuted

  return (
    <Screen edges={["top"]} background={bg}>
      <View style={[styles.header, { borderBottomColor: dark ? rawColors.dark.border : colors.border }]}>
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
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  back: { padding: spacing.xs },
  scroll: { padding: spacing.base, gap: spacing.lg, paddingBottom: spacing["2xl"] },
  intro: {},
  block: { gap: spacing.xs },
})
