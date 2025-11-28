"use server"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { listProducts } from "@lib/data/products"

interface CategoryShowcaseProps {
  categories: HttpTypes.StoreProductCategory[]
  countryCode: string
}

const getRandomImage = (index: number) => {
  const images = [
    "https://i.ibb.co/HfD36V9w/Screenshot-2025-11-27-at-2-36-01-AM.png",
    "https://i.ibb.co.com/cXw2rrD7/hp.jpg",
    "https://i.ibb.co/HfD36V9w/Screenshot-2025-11-27-at-2-36-01-AM.png",
    "https://i.ibb.co.com/cXw2rrD7/hp.jpg",
    "https://i.ibb.co/HfD36V9w/Screenshot-2025-11-27-at-2-36-01-AM.png",
    "https://i.ibb.co.com/cXw2rrD7/hp.jpg",
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
    <div className="w-full py-12 xsmall:py-16 small:py-24">
      <div className="content-container">
        <div className="flex flex-col gap-12 xsmall:gap-16">

          {/* Category Grid - Responsive */}
          <div className="w-full">
            <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 gap-4 xsmall:gap-6 small:gap-8">
              {topLevelCategories.map((category) => {
                const currentImage = getRandomImage(imageIndex++)
                return (
                  <LocalizedClientLink
                    key={category.id}
                    href={`/categories/${category.handle}`}
                    className="relative group cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 aspect-square xsmall:aspect-auto xsmall:h-56 small:h-64"
                  >
                    <Image
                      src={currentImage}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center px-3 xsmall:px-4 py-3 xsmall:py-4">
                      <h3 className="text-center font-semibold text-white text-lg xsmall:text-xl small:text-2xl line-clamp-2">
                        {category.name}
                      </h3>
                    </div>
                  </LocalizedClientLink>
                )
              })}
            </div>
          </div>

          {/* Featured ZAHAN Section */}
          <div className="w-full pt-12 xsmall:pt-16 small:pt-24">
            <div className="flex flex-col xsmall:flex-row bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg">
              {/* Left Section - Full width on mobile, 3/4 on larger screens */}
              <div className="w-full xsmall:w-3/4 p-6 xsmall:p-8 small:p-12 flex flex-col justify-between bg-gradient-to-br from-gray-50 to-white">
                <div>
                  <h2 className="text-2xl xsmall:text-3xl small:text-4xl font-bold text-gray-900 mb-2">
                    ZAHAN
                  </h2>
                  <h3 className="text-base xsmall:text-lg small:text-xl font-semibold text-gray-600 mb-4">
                    Premium Collection
                  </h3>
                  <p className="text-gray-600 text-sm xsmall:text-base leading-relaxed">
                    Discover our exclusive selection of premium products curated for excellence and style.
                  </p>
                </div>
                <LocalizedClientLink
                  href="/categories"
                  className="inline-block text-sm xsmall:text-base font-semibold text-black hover:text-gray-600 transition-colors mt-4 xsmall:mt-0"
                >
                  Shop Now →
                </LocalizedClientLink>
              </div>

              {/* Right Section - Hidden on mobile, 1/4 width on larger screens */}
              <div className="hidden xsmall:block xsmall:w-1/4 relative overflow-hidden min-h-48 xsmall:min-h-64">
                <Image
                  src={getRandomImage(6)}
                  alt="ZAHAN"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Category Products Sections */}
          <div className="w-full flex flex-col gap-12 pt-8 xsmall:pt-12 small:pt-16 border-t border-grey-20">
            {topLevelCategories.map((category, categoryIndex) => (
              <CategoryProductSection
                key={category.id}
                category={category}
                countryCode={countryCode}
                imageIndex={categoryIndex}
              />
            ))}
          </div>

          {/* Featured Products Row Section */}
          <div className="w-full pt-8 xsmall:pt-12 small:pt-16 mt-8 border-t border-grey-20">
            <h2 className="text-2xl xsmall:text-3xl small:text-4xl font-bold text-grey-90 mb-6 xsmall:mb-8">
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
      limit: 8,
    },
    countryCode,
  })

  const products = response.products || []

  return (
    <div className="w-full flex gap-6">
      {/* Left: Category Card - 404x404 */}
      <div
        className="flex-shrink-0 relative overflow-hidden shadow-sm"
        style={{
          width: "404px",
          height: "404px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
        }}
      >
        <Image
          src={getRandomImage(imageIndex)}
          alt={category.name}
          fill
          className="object-cover"
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
      </div>

      {/* Right: Product Grid - 2x4 of 192x192 boxes */}
      <div className="flex-1">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "repeat(2, 192px)",
          }}
        >
          {products.map((product) => (
            <LocalizedClientLink
              key={product.id}
              href={`/products/${product.handle}`}
              className="relative group overflow-hidden shadow-sm bg-gray-100"
              style={{
                width: "100%",
                height: "192px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
              }}
            >
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0].url}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400 text-sm">No image</span>
                </div>
              )}
            </LocalizedClientLink>
          ))}
        </div>
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
      limit: 8,
    },
    countryCode,
  })

  const products = response.products || []

  return (
    <div
      className="grid gap-4 w-full"
      style={{
        gridTemplateColumns: "repeat(8, 1fr)",
        gridAutoRows: "192px",
      }}
    >
      {products.slice(0, 7).map((product) => (
        <LocalizedClientLink
          key={product.id}
          href={`/products/${product.handle}`}
          className="relative group overflow-hidden shadow-sm bg-gray-100"
          style={{
            width: "100%",
            height: "192px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
          }}
        >
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </LocalizedClientLink>
      ))}

      {/* 8th Card - See All Button with Hover Overlay */}
      <div
        className="relative group overflow-hidden shadow-sm bg-gradient-to-br from-gray-100 to-gray-200"
        style={{
          width: "100%",
          height: "192px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
        }}
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