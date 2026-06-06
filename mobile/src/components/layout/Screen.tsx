import { StyleSheet, View } from "react-native"
import { SafeAreaView, Edge } from "react-native-safe-area-context"
import { colors } from "@design/theme"

interface ScreenProps {
  children: React.ReactNode
  edges?: Edge[]
  background?: string
}

export function Screen({
  children,
  edges = ["top"],
  background = colors.grey[0],
}: ScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safe, { backgroundColor: background }]}
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
