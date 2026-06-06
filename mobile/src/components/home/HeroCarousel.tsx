import { useEffect, useRef, useState } from "react"
import {
  View,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from "react-native"
import { Image } from "expo-image"
import { useRouter, Href } from "expo-router"
import { ThemedText } from "../ui/ThemedText"
import { HeroSlide } from "@api/enhancements"
import { animation, colors, spacing, borderRadius } from "@design/theme"

interface HeroCarouselProps {
  slides: HeroSlide[]
}

/** Auto-playing hero carousel with a crossfade between remote banner images. */
export function HeroCarousel({ slides }: HeroCarouselProps) {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const [index, setIndex] = useState(0)
  const opacity = useRef(new Animated.Value(1)).current

  const remoteSlides = slides.filter((s) => /^https?:\/\//.test(s.image))

  useEffect(() => {
    if (remoteSlides.length <= 1) return
    const timer = setInterval(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: animation.duration.normal,
        useNativeDriver: true,
      }).start(() => {
        setIndex((i) => (i + 1) % remoteSlides.length)
        Animated.timing(opacity, {
          toValue: 1,
          duration: animation.duration.normal,
          useNativeDriver: true,
        }).start()
      })
    }, animation.heroAutoplayInterval)
    return () => clearInterval(timer)
  }, [remoteSlides.length, opacity])

  if (remoteSlides.length === 0) return null

  const slide = remoteSlides[index]
  const height = Math.min(width * 0.55, 260)

  const toLink = () => {
    if (!slide.link) return
    router.push(slide.link as Href)
  }

  return (
    <View style={[styles.wrap, { paddingHorizontal: spacing.base }]}>
      <Pressable onPress={toLink}>
        <Animated.View style={{ opacity }}>
          <Image
            source={slide.image}
            style={[styles.image, { height }]}
            contentFit="cover"
            transition={200}
          />
          {slide.title || slide.subtitle ? (
            <View style={styles.overlay}>
              {slide.title ? (
                <ThemedText variant="hero" color={colors.grey[0]}>
                  {slide.title}
                </ThemedText>
              ) : null}
              {slide.subtitle ? (
                <ThemedText variant="subheading" color={colors.grey[10]}>
                  {slide.subtitle}
                </ThemedText>
              ) : null}
            </View>
          ) : null}
        </Animated.View>
      </Pressable>

      {remoteSlides.length > 1 ? (
        <View style={styles.dots}>
          {remoteSlides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === index ? colors.brand.teal : colors.grey[30],
                  width: i === index ? 18 : 6,
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { paddingTop: spacing.base, gap: spacing.sm },
  image: {
    width: "100%",
    borderRadius: borderRadius.large,
    backgroundColor: colors.grey[10],
  },
  overlay: {
    position: "absolute",
    left: spacing.xl,
    bottom: spacing.xl,
    gap: spacing.xs,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
  },
  dot: {
    height: 6,
    borderRadius: borderRadius.circle,
  },
})
