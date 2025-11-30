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
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + 30)

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
      priceCurrency: region?.currency_code?.toUpperCase() || "USD",
      price: product.variants?.[0]?.prices?.[0]?.amount
        ? (product.variants[0].prices[0].amount / 100).toString()
        : "0",
      availability: product.variants?.some(
        (v) => !v.manage_inventory || (v.inventory_quantity || 0) > 0
      )
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceValidUntil: futureDate
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

      <div className="w-full min-h-screen bg-white">
        <div className="content-container py-2 small:py-2 medium:py-3">
          {/* Breadcrumb Navigation */}
          <nav className="mb-2 small:mb-3 flex items-center gap-2 text-xs small:text-sm text-slate-600 overflow-x-auto pb-2">
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
            className="grid grid-cols-1 gap-3 small:grid-cols-2 mb-12 small:mb-16 medium:mb-20"
            data-testid="product-container"
          >
            {/* Product Images - Full width on mobile, 2/3 on desktop */}
            <div className="flex flex-col gap-4">
              <div className="">
                <ImageGallery images={images} />
              </div>
            </div>

            {/* Product Info and Actions */}
            <div className="flex flex-col gap-4 small:gap-8 ">
              {/* Header Info Section */}
              <div className="flex flex-col gap-4 small:gap-6 bg-slate-50 py-2 px-8">
                <ProductInfo product={product} />
              </div>

              {/* Actions Section */}
              <div className="flex flex-col gap-3 small:gap-4 bg-white py-2 px-8">
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
          <div className="border-t-2 border-slate-200 pt-8 small:pt-12 medium:pt-16">
            <ProductTabs product={product} />
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="w-full bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 small:py-20 border-t border-slate-200">
        <div
          className="content-container"
          data-testid="related-products-container"
        >
          <div className="mb-10">
            <h2 className="text-2xl small:text-3xl font-bold text-slate-900 mb-2">
              You May Also Like
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-transparent rounded-full"></div>
          </div>
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts product={product} countryCode={countryCode} />
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default ProductTemplate
