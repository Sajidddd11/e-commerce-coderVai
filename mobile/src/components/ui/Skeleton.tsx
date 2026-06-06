import { useEffect, useRef } from "react"
import { Animated, StyleSheet, ViewStyle, DimensionValue } from "react-native"
import { useAppTheme } from "@hooks/useAppTheme";
import { borderRadius } from "@design/theme"

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
  const { colors } = useAppTheme();

  const opacityRef = useRef(new Animated.Value(0.4))

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityRef.current, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacityRef.current, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.skeleton,
          opacity: opacityRef.current,
        },
        style,
      ]}
    />
  )
}
