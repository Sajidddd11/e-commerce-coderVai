import { useEffect, useRef } from "react"
import { Animated, StyleSheet, ViewStyle, DimensionValue } from "react-native"
import { colors, borderRadius } from "@design/theme"

interface SkeletonProps {
  width?: DimensionValue
  height?: DimensionValue
  radius?: number
  style?: ViewStyle
}

export function Skeleton({
  width = "100%",
  height = 16,
  radius = borderRadius.base,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius: radius, opacity },
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.grey[20],
  },
})
