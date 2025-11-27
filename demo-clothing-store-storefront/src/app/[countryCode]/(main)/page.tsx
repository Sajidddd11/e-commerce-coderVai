import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import Announcement from "@modules/home/components/announcement"
import CategoryShowcase from "@modules/home/components/category-showcase"
import FeaturedProductsShowcase from "@modules/home/components/featured-products-showcase"
import TrustSection from "@modules/home/components/trust-section"
import CTASection from "@modules/home/components/cta-section"
import { listCollections } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"

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
  const categories = await listCategories()

  if (!collections || !region || !categories) {
    return null
  }

  return (
    <div className="w-full">
      <Announcement />
      <Hero />
      <CategoryShowcase categories={categories} />
      <FeaturedProductsShowcase collections={collections} region={region} />
      <TrustSection />
      <CTASection />
    </div>
  )
}
