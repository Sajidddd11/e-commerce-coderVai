import { Metadata } from "next"

export const dynamic = 'force-dynamic'

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    search?: string
    category?: string // comma-separated category IDs
    priceMin?: string
    priceMax?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams])
  const { sortBy, page, search, category, priceMin, priceMax } = searchParams

  // Parse comma-separated category IDs
  const categoryIds = category ? category.split(",").filter(Boolean) : undefined

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      search={search}
      categoryIds={categoryIds}
      priceMin={priceMin ? parseFloat(priceMin) : undefined}
      priceMax={priceMax ? parseFloat(priceMax) : undefined}
    />
  )
}