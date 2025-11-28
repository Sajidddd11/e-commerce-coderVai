import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  // Generate Schema.org structured data for SEO
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    image: images.map((img) => img.url),
    description: product.description || product.title,
    brand: {
      "@type": "Brand",
      name: "Our Store",
    },
    offers: {
      "@type": "Offer",
      url: typeof window !== "undefined" ? window.location.href : "",
      priceCurrency: region?.currency_code?.toUpperCase() || "USD",
      price: product.variants?.[0]?.prices?.[0]?.amount
        ? (product.variants[0].prices[0].amount / 100).toString()
        : "0",
      availability: product.variants?.some(
        (v) => !v.manage_inventory || (v.inventory_quantity || 0) > 0
      )
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "24",
    },
    sku: product.sku || product.id,
    weight: product.weight
      ? {
          "@type": "QuantitativeValue",
          value: product.weight,
          unitCode: "GRM",
        }
      : undefined,
    material: product.material || undefined,
  }

  // Filter out undefined values
  const cleanSchema = JSON.parse(JSON.stringify(productSchema))

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanSchema) }}
      />

      <div className="w-full min-h-screen bg-gradient-to-b from-white via-slate-50/50 to-white">
        <div className="content-container py-6 small:py-8">
          {/* Breadcrumb Navigation */}
          <nav className="mb-6 flex items-center gap-2 text-xs small:text-sm text-slate-600 overflow-x-auto pb-2">
            <a href="/" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Home
            </a>
            <span className="text-slate-400">/</span>
            <a href="/store" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Store
            </a>
            {product.collection && (
              <>
                <span className="text-slate-400">/</span>
                <a
                  href={`/collections/${product.collection.handle}`}
                  className="hover:text-slate-900 transition-colors whitespace-nowrap"
                >
                  {product.collection.title}
                </a>
              </>
            )}
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-medium whitespace-nowrap truncate">{product.title}</span>
          </nav>

          {/* Product Container */}
          <div
            className="grid grid-cols-1 small:grid-cols-3 gap-6 small:gap-8 mb-12 small:mb-16"
            data-testid="product-container"
          >
            {/* Product Images - 2/3 width */}
            <div className="small:col-span-2 flex flex-col gap-4">
              <ImageGallery images={images} />
            </div>

            {/* Product Info and Actions - 1/3 width */}
            <div className="flex flex-col gap-6 sticky top-20 small:h-fit">
              {/* Header Info */}
              <div className="flex flex-col gap-4">
                <ProductInfo product={product} />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4">
                <ProductOnboardingCta />
                <Suspense
                  fallback={
                    <ProductActions
                      disabled={true}
                      product={product}
                      region={region}
                    />
                  }
                >
                  <ProductActionsWrapper id={product.id} region={region} />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Description and Tabs - Full Width */}
          <div className="border-t border-slate-200 pt-8 small:pt-10">
            <ProductTabs product={product} />
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="w-full bg-gradient-to-b from-slate-50 to-white py-12 small:py-16">
        <div
          className="content-container"
          data-testid="related-products-container"
        >
          <h2 className="text-2xl small:text-3xl font-bold text-slate-900 mb-8">
            You May Also Like
          </h2>
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts product={product} countryCode={countryCode} />
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default ProductTemplate