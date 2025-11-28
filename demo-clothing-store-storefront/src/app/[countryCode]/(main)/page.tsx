import { Metadata } from "next"

import Announcement from "@modules/home/components/announcement"
import CategoryShowcase from "@modules/home/components/category-showcase"
import FeaturedProductsShowcase from "@modules/home/components/featured-products-showcase"
import TrustSection from "@modules/home/components/trust-section"
import CTASection from "@modules/home/components/cta-section"
import HomeHero from "@modules/home/components/home-hero"
import { listCollections } from "@lib/data/collections"
import { listCategories, filterCategoriesWithProducts } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"

export const revalidate = 300 // Revalidate every 5 minutes

export const metadata: Metadata = {
  title: "ZAHAN Fashion and Lifestyle",
  description:
    "Discover our curated collection of premium clothing and accessories. Shop the latest trends with fast shipping and secure payments.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)
  const { collections } = await listCollections({
    fields: "id, handle, title",
  })
  const allCategories = await listCategories()
  const categories = filterCategoriesWithProducts(allCategories)

  if (!collections || !region || !categories || categories.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      <Announcement />
      <HomeHero />
      <CategoryShowcase categories={categories} countryCode={countryCode} />
      <FeaturedProductsShowcase collections={collections} region={region} />
      <TrustSection />
      <CTASection />
    </div>
  )
}