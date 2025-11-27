import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

interface CategoryShowcaseProps {
  categories: HttpTypes.StoreProductCategory[]
}

const demoImages = [
  "https://images.unsplash.com/photo-1551986782-d244ca7868ca?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1523381210435-271e8be1f52b?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1595777707802-51b39fd9b371?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1595580571289-2206f4a10b52?w=400&h=400&fit=crop",
]

export default function CategoryShowcase({
  categories,
}: CategoryShowcaseProps) {
  const topLevelCategories = categories
    .filter((cat) => !cat.parent_category)
    .slice(0, 6)

  return (
    <div className="w-full bg-white py-16 small:py-24">
      <div className="content-container">
        <div className="flex flex-col gap-12">
          {/* Header */}
          <div className="flex flex-col gap-2 text-center small:text-left">
            <h2 className="text-2xl small:text-3xl font-bold text-slate-900">
              Shop by Category
            </h2>
            <p className="text-slate-600 text-sm small:text-base">
              Explore our curated collections handpicked just for you
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 small:grid-cols-3 gap-4 small:gap-6">
            {topLevelCategories.map((category, index) => (
              <LocalizedClientLink
                key={category.id}
                href={`/categories/${category.handle}`}
                className="group relative overflow-hidden rounded-lg aspect-square cursor-pointer transition-all duration-300 hover:shadow-2xl"
              >
                {/* Background Image */}
                <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-100">
                  <Image
                    src={demoImages[3]}
                    alt={category.name}
                    fill
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 gap-3 h-full">
                  <span className="text-3xl text-white/80 group-hover:text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {category.name} →
                  </span>
                </div>
              </LocalizedClientLink>
            ))}
          </div>

          {/* View All Categories Link */}
          <div className="flex justify-center small:justify-start pt-4">
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center gap-2 text-slate-900 hover:text-slate-600 font-semibold text-sm small:text-base group transition-colors"
            >
              View All Categories
              <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}
