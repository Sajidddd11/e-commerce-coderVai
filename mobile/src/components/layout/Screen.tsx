import { StyleSheet, View } from "react-native"
import { SafeAreaView, Edge } from "react-native-safe-area-context"
import { useAppTheme } from "@hooks/useAppTheme"

interface ScreenProps {
  children: React.ReactNode
  edges?: Edge[]
  background?: string
}

export function Screen({
  children,
  edges = ["top"],
  background,
}: ScreenProps) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safe, { backgroundColor: background ?? colors.background }]}
    >
      <View style={styles.inner}>{children}</View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
})
