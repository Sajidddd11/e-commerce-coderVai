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
  const height = 176 // Match HeroBanner

  const toLink = () => {
    if (!slide.link) return
    router.push(slide.link as Href)
  }

  return (
    <View style={[styles.wrap, { paddingHorizontal: spacing.base }]}>
      <Pressable onPress={toLink}>
        <Animated.View style={{ opacity, height, borderRadius: borderRadius.large, overflow: "hidden" }}>
          <Image
            source={slide.image}
            style={[styles.image, { height }]}
            contentFit="cover"
            transition={200}
          />
          {slide.title || slide.subtitle ? (
            <View style={styles.overlay}>
              {slide.subtitle ? (
                <ThemedText variant="bodySmall" color={colors.brand.teal} style={styles.subtitle}>
                  {slide.subtitle}
                </ThemedText>
              ) : null}
              {slide.title ? (
                <ThemedText variant="sectionHeading" color={colors.grey[0]} style={styles.title}>
                  {slide.title}
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
                    i === index ? colors.brand.teal : "rgba(255,255,255,0.4)",
                  width: i === index ? 16 : 6,
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
  wrap: { paddingTop: spacing.base, position: "relative" },
  image: {
    width: "100%",
    backgroundColor: colors.slate[900],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 24, // px-6
    paddingVertical: 20, // py-5
    justifyContent: "center",
    alignItems: "flex-start",
    backgroundColor: "rgba(15, 23, 42, 0.5)", // slight darkening for text
  },
  subtitle: {
    letterSpacing: 3.2,
    fontWeight: "500",
    textTransform: "uppercase",
    fontSize: 10,
    marginBottom: 4,
  },
  title: {
    fontWeight: "700",
    lineHeight: 32,
    fontSize: 24,
    marginBottom: 4,
  },
  dots: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
})
