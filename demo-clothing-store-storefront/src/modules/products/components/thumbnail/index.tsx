import { Container, clx } from "@medusajs/ui"
import Image from "next/image"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  // TODO: Fix image typings
  images?: any[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  className,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <Container
      className="relative bg-gray-100 rounded-none overflow-hidden flex-grow" style={{ aspectRatio: "1 / 1" }}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder image={initialImage} size={size} />
    </Container>
  )
}

const ImageOrPlaceholder = ({
  image,
  size,
}: Pick<ThumbnailProps, "size"> & { image?: string }) => {
  // Determine sizes based on thumbnail size
  const sizesMap = {
    small: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px",
    medium: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px",
    large: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px",
    full: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px",
    square: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px",
  }

  return image ? (
    <Image
      src={image}
      alt="Thumbnail"
      className="object-cover group-hover:scale-105 transition-transform duration-300"
      draggable={false}
      quality={50}
      fill
      sizes={sizesMap[size || "small"]}
    />
  ) : (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
