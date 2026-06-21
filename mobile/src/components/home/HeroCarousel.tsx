import { useEffect, useRef, useState } from "react"
import {
  View,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native"
import { Image } from "expo-image"
import { useRouter, Href } from "expo-router"
import { HeroSlide } from "@api/enhancements"
import { animation, colors, spacing, borderRadius } from "@design/theme"

interface HeroCarouselProps {
  slides: HeroSlide[]
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const [index, setIndex] = useState(0)
  const scrollRef = useRef<ScrollView>(null)

  const validSlides = slides.filter((s) => s.image != null)

  const H_PAD = spacing.base
  const cardWidth = width - H_PAD * 2
  // 2:1 — industry standard for landscape promo banners
  const cardHeight = Math.round(cardWidth / 2)

  useEffect(() => {
    if (validSlides.length <= 1) return
    const timer = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % validSlides.length
        scrollRef.current?.scrollTo({ x: next * cardWidth, animated: true })
        return next
      })
    }, animation.heroAutoplayInterval || 4000)
    return () => clearInterval(timer)
  }, [validSlides.length, cardWidth])

  if (validSlides.length === 0) return null

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x
    const newIndex = Math.round(x / cardWidth)
    if (newIndex !== index) setIndex(newIndex)
  }

  return (
    <View style={{ paddingHorizontal: H_PAD, paddingTop: spacing.base }}>
      {/* Card — clips rounded corners */}
      <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>

        {/* Scrollable images */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEnabled={validSlides.length > 1}
          bounces={false}
        >
          {validSlides.map((item, i) => {
            const toLink = () => {
              if (!item.link) return
              router.push(item.link as Href)
            }
            return (
              <Pressable
                key={i}
                onPress={toLink}
                style={{ width: cardWidth, height: cardHeight }}
              >
                <Image
                  source={item.image}
                  style={{ width: cardWidth, height: cardHeight, borderRadius: borderRadius.xl }}
                  contentFit="cover"
                  transition={200}
                />
              </Pressable>
            )
          })}
        </ScrollView>

        {/* Normal dots at the bottom inside the card */}
        {validSlides.length > 1 ? (
          <View style={styles.paginationContainer} pointerEvents="none">
            {validSlides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dotBase,
                  i === index ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        ) : null}

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dotBase: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.brand.teal,
  },
  dotInactive: {
    width: 6,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
})
