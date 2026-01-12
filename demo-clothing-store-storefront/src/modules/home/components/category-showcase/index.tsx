"use server"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { listProducts } from "@lib/data/products"
import ProductCardWithPrice from "./product-card"
import ResponsiveProductGrid from "./responsive-product-grid"
import { Ratio } from "lucide-react"

interface CategoryShowcaseProps {
  categories: HttpTypes.StoreProductCategory[]
  countryCode: string
}

const getRandomImage = (index: number) => {
  const images = [
    "https://i.ibb.co.com/6SypGNs/1.jpg",
    "https://i.ibb.co.com/qYb0q9Rn/Black-Premium-Leather-Square-Backpack-SB-BP129-3.jpg",
    "https://i.ibb.co.com/B5LMxDy2/3.jpg",
    "https://i.ibb.co.com/G4Mh2PYJ/4.jpg",
    "https://i.ibb.co.com/gFrZVRn6/5.webp",
    "https://i.ibb.co.com/PZTBMyBG/6.webp",
    "https://i.ibb.co.com/B5t4yDsR/Screenshot-2025-11-27-at-2-41-10-AM.png",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1595707707802-51b39fd9b371?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1595580571289-2206f4a10b52?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1539533057592-4d2255f40579?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=400&fit=crop",
  ]
  return images[index % images.length]
}

export default async function CategoryShowcase({
  categories,
  countryCode,
}: CategoryShowcaseProps) {
  const topLevelCategories = categories
    .filter((cat) => !cat.parent_category && cat.products && cat.products.length > 0)
    .slice(0, 6)

  let imageIndex = 0

  return (
    <div className="w-full py-2 xsmall:py-10 small:py-16">
      <div className="content-container">
        <div className="flex flex-col">

          {/* Top Categories Heading - Section Heading (Montserrat 600) */}
          <div className="w-full mb-6 xsmall:mb-8 small:mb-10 flex flex-col items-center">
            <h2 className="typography-section-heading text-grey-90 mb-2 xsmall:mb-3 text-center">
              Top Categories
            </h2>
            <div className="w-16 xsmall:w-20 h-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></div>
          </div>

          {/* Category Grid - Responsive */}
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-3 medium:grid-cols-6 gap-2 small:gap-3">
              {topLevelCategories.map((category) => {
                const currentImage = getRandomImage(imageIndex++)
                return (
                  <LocalizedClientLink
                    key={category.id}
                    href={`/categories/${category.handle}`}
                    className="relative group cursor-pointer overflow-hidden shadow-sm rounded-sm hover:shadow-md transition-all duration-300"
                    style={{ aspectRatio: "1 / 1" }}
                  >
                    <Image
                      src={currentImage}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{ aspectRatio: "1 / 1" }}
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center px-2 xsmall:px-4 py-1 xsmall:py-4">
                      <h3 className="typography-subheading-sm text-white text-center line-clamp-2 xsmall:text-xl">
                        {category.name}
                      </h3>
                    </div>
                  </LocalizedClientLink>
                )
              })}
            </div>
          </div>

          {/* Featured ZAHAN Section */}
          <div className="w-full mt-2 xsmall:mt-5">
            {/* Big Card */}
            <div className=" flex flex-col xsmall:flex-row bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg">
              {/* Left Section - Full width on mobile, 3/4 on larger screens */}
              <div className="w-full xsmall:w-3/4 p-6 xsmall:p-8 small:p-12 flex flex-col justify-between bg-gradient-to-br from-gray-50 to-white">
                <div>
                  {/* Brand Text - Montserrat 700 */}
                  <h2 className="typography-brand-lg text-gray-900 mb-2">
                    ZAHAN
                  </h2>
                  {/* Sub-Heading - Montserrat 500 */}
                  <h3 className="typography-subheading text-gray-600 mb-4">
                    Premium Collection
                  </h3>
                  {/* Body Text - Inter 400 */}
                  <p className="typography-body text-gray-600">
                    Discover our exclusive selection of premium products curated for excellence and style.
                  </p>
                </div>
                {/* Button - Inter 600 */}
                <LocalizedClientLink
                  href="/store"
                  className="typography-button inline-block text-black hover:text-gray-600 transition-colors mt-4 xsmall:mt-0"
                >
                  Shop Now →
                </LocalizedClientLink>
              </div>

              {/* Right Section - Hidden on mobile, 1/4 width on larger screens */}
              <div className=" xsmall:block xsmall:w-1/4 relative overflow-hidden min-h-28 xsmall:min-h-64">
                <Image
                  src={getRandomImage(6)}
                  alt="ZAHAN"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 25vw"
                />
              </div>
            </div>
          </div>

          {/* Category Products Sections */}
          <div className="w-full flex flex-col gap-12 pt-8 xsmall:pt-12 small:pt-16">
            {topLevelCategories.map((category, categoryIndex) => (
              <CategoryProductSection
                key={category.id}
                category={category}
                countryCode={countryCode}
                imageIndex={categoryIndex}
              />
            ))}
          </div>

          {/* Featured Products Row Section - Section Heading (Montserrat 600) */}
          <div className="w-full pt-8 xsmall:pt-12 small:pt-16 mt-8 border-t border-grey-20">
            <h2 className="typography-section-heading text-grey-90 mb-6 xsmall:mb-8">
              Featured Products
            </h2>
            <AllProductsRow countryCode={countryCode} />
          </div>
        </div>
      </div>
    </div>
  )
}

async function CategoryProductSection({
  category,
  countryCode,
  imageIndex,
}: {
  category: HttpTypes.StoreProductCategory
  countryCode: string
  imageIndex: number
}) {
  const { response } = await listProducts({
    queryParams: {
      category_id: [category.id],
      limit: 10,
      fields: "*variants.calculated_price",
    },
    countryCode,
  })

  const products = response.products || []

  return (
    <div className="w-full flex flex-col">
      {/* Category Title - Visible on all devices */}
      <h3 className="text-xl xsmall:text-2xl small:text-3xl font-bold text-grey-90 mb-4 xsmall:mb-6">
        {category.name}
      </h3>

      {/* Main Section */}
      <div className="w-full grid grid-cols-2 xsmall:grid-cols-4 xsmall:grid-rows-3 small:grid-rows-2 small:grid-cols-6 gap-4 small:gap-6">
        {/* Left: Category Card - Hidden on mobile, visible on small and above */}
        <div className="col-span-2 xsmall:row-span-2">
          <LocalizedClientLink
            href={`/categories/${category.handle}`}
            className="w-full h-full flex-shrink-0 relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group block"
            style={{
              aspectRatio: "1 / 1",
            }}
          >
            <Image
              src={getRandomImage(imageIndex)}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div
              className="absolute bottom-0 left-0 right-0 flex items-center justify-center px-4"
              style={{
                height: "60px",
              }}
            >
              <h3 className="text-center font-semibold text-white text-2xl line-clamp-2">
                {category.name}
              </h3>
            </div>
          </LocalizedClientLink>
        </div>


        {/* Right: Product Grid - Responsive columns and product count based on device */}
        <ResponsiveProductGrid products={products} categoryHandle={category.handle} />
      </div>
    </div>
  )
}


async function AllProductsRow({
  countryCode,
}: {
  countryCode: string
}) {
  const { response } = await listProducts({
    queryParams: {
      limit: 5,
      fields: "*variants.calculated_price",
      order: "-created_at",
    },
    countryCode,
  })

  const products = response.products || []

  return (
    <div
      className="grid grid-cols-2 xsmall:grid-cols-3 small:grid-cols-6 gap-1 xsmall:gap-2 small:gap-4 w-full"
      style={{
      }}
    >
      {products.map((product) => (
        <div
          key={product.id}
          className="flex justify-center"
        >
          <ProductCardWithPrice product={product} />
        </div>
      ))}

      {/* 6th Card - See All Button with Hover Overlay */}
      <div
        className="relative group overflow-hidden shadow-sm bg-gradient-to-br from-gray-100 to-gray-200"

      >
        <div className="w-full h-full flex items-center justify-center group-hover:opacity-30 transition-opacity duration-300">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              See All
            </h3>
            <p className="text-sm text-gray-600">
              View all products
            </p>
          </div>
        </div>

        {/* Hover Overlay */}
        <LocalizedClientLink
          href="/store"
          className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        >
          <div className="text-center px-4">
            <p className="text-white font-semibold text-lg">
              See All Products
            </p>
            <p className="text-white text-sm mt-2">
              Browse our complete collection
            </p>
          </div>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
