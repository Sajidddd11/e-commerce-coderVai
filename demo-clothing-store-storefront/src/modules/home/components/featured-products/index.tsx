import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"

export default async function FeaturedProducts({
  collections,
  region,
}: {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
}) {
  return collections.map((collection) => (
    <div className="h-2 w-full border border-red-500">
      <li key={collection.id}>
        <ProductRail collection={collection} region={region} />
      </li>
    </div>

  ))
}
