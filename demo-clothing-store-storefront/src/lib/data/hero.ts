import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export interface HeroSlide {
  id: string
  slide_type: "side_image_left" | "side_image_right" | "center_text" | "video" | "static_image"
  title: string | null
  description: string | null
  button_text: string | null
  button_link: string | null
  background_image: string | null
  side_image: string | null
  video_url: string | null
  overlay_color: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export const listHeroSlides = async () => {
  const next = {
    ...(await getCacheOptions("hero")),
    revalidate: 60, // Revalidate every 60 seconds
  }

  return sdk.client
    .fetch<{ slides: HeroSlide[] }>(
      "/store/hero-slides",
      {
        next,
      }
    )
    .then(({ slides }) => slides)
    .catch((err) => {
      console.error("Error fetching hero slides from API:", err)
      return [] as HeroSlide[]
    })
}
