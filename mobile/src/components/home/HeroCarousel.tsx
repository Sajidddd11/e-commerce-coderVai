import { useEffect, useRef, useState } from "react"
import {
  View,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  FlatList,
} from "react-native"
import { Image } from "expo-image"
import { useRouter, Href } from "expo-router"
import { ThemedText } from "../ui/ThemedText"
import { HeroSlide } from "@api/enhancements"
import { animation, colors, spacing, borderRadius } from "@design/theme"

interface HeroCarouselProps {
  slides: HeroSlide[]
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const [index, setIndex] = useState(0)
  const listRef = useRef<FlatList>(null)

  const validSlides = slides.filter((s) => s.image != null)

  useEffect(() => {
    if (validSlides.length <= 1) return
    const timer = setInterval(() => {
      setIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % validSlides.length
        listRef.current?.scrollToIndex({ index: nextIndex, animated: true })
        return nextIndex
      })
    }, animation.heroAutoplayInterval || 4000)
    return () => clearInterval(timer)
  }, [validSlides.length])

  if (validSlides.length === 0) return null

  // Restore the exact image aspect ratio so it doesn't crop (destroy the ratio)
  // We make it "bigger" by letting it bleed edge-to-edge (removing padding).
  const frameAspectRatio = 1280 / 591 
  const itemWidth = width // Full screen width

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setIndex(viewableItems[0].index || 0)
    }
  }).current
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current

  const renderItem = ({ item }: { item: HeroSlide }) => {
    const toLink = () => {
      if (!item.link) return
      router.push(item.link as Href)
    }

    return (
      <View style={{ width: itemWidth }}>
        <Pressable onPress={toLink} style={styles.slideWrap}>
          <Image
            source={item.image}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          {item.title || item.subtitle ? (
            <View style={styles.overlay}>
              {item.subtitle ? (
                <ThemedText variant="bodySmall" color={colors.brand.teal} style={styles.subtitle}>
                  {item.subtitle}
                </ThemedText>
              ) : null}
              {item.title ? (
                <ThemedText variant="sectionHeading" color={colors.grey[0]} style={styles.title}>
                  {item.title}
                </ThemedText>
              ) : null}
            </View>
          ) : null}
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.listContainer, { aspectRatio: frameAspectRatio }]}>
        <FlatList
          ref={listRef}
          data={validSlides}
          renderItem={renderItem}
          keyExtractor={(_, idx) => idx.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEventThrottle={16}
        />
      </View>

      {validSlides.length > 1 ? (
        <View style={styles.dots}>
          {validSlides.map((_, i) => (
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
  listContainer: {
    width: "100%",
    overflow: "hidden",
  },
  slideWrap: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.slate[900],
  },
  overlay: {
    ...StyleSheet.absoluteFill,
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
