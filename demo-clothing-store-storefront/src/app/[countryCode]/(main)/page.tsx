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

  // Fetch all core layout and user data concurrently via Promise.all
  // to eliminate sequential network request waterfalls
  const [region, collectionsData, allCategories, heroSlides, customer] =
    await Promise.all([
      getRegion(countryCode),
      listCollections({ fields: "id, handle, title" }),
      listCategories(),
      listHeroSlides(),
      retrieveCustomer(),
    ])

  const collections = collectionsData?.collections
  const categories = filterCategoriesWithProducts(allCategories)

  if (!collections || !region || !categories || categories.length === 0) {
    return null
  }

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
