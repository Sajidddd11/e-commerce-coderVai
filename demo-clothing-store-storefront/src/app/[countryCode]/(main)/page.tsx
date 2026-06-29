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
import { retrieveCustomer } from "@lib/data/customer"
import { listHeroSlides } from "@lib/data/hero"

// No static revalidate — this page reads auth cookies so Next.js makes it
// dynamic automatically. Each request gets the correct customer context.

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
  const heroSlides = await listHeroSlides()

  if (!collections || !region || !categories || categories.length === 0) {
    return null
  }

  // Fetch the logged-in customer so we can pass their ID to the recommendation
  // engine. Without this, the API queries only by session_id (current browser
  // session) and never reaches the 5-event threshold for "Suggested For You".
  const customer = await retrieveCustomer()

  return (
    <div className="w-full">
      <section data-testid="section-announcement">
        <Announcement />
      </section>
      <section data-testid="section-hero">
        <HomeHero slides={heroSlides} />
      </section>
      <section data-testid="section-categories">
        <CategoryShowcase 
          categories={categories} 
          countryCode={countryCode} 
          region={region}
          customerId={customer?.id}
        />
      </section>
      <section data-testid="section-featured-products">
        <FeaturedProductsShowcase collections={collections} region={region} />
      </section>
      <section data-testid="section-trust">
        <TrustSection />
      </section>
      <section data-testid="section-cta">
        <CTASection />
      </section>
    </div>
  )
}
