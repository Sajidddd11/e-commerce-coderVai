"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"
import ReviewsSection from "@modules/products/components/reviews-section"
import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Description",
      component: <ProductDescriptionTab product={product} />,
    },
    {
      label: "Specifications",
      component: <SpecificationsTab product={product} />,
    },
    {
      label: "Customer Reviews",
      component: <ReviewsTab />,
    },
    {
      label: "Shipping & Returns",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductDescriptionTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-sm-regular py-8 space-y-4">
      {product.description ? (
        <div className="prose prose-sm max-w-none">
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      ) : (
        <p className="text-slate-500">No description available.</p>
      )}

      {product.tags && product.tags.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-3">Related Tags</h4>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium"
              >
                {tag.value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const SpecificationsTab = ({ product }: ProductTabsProps) => {
  const specs = [
    { label: "Material", value: product.material },
    { label: "Weight", value: product.weight ? `${product.weight}g` : null },
    { label: "Dimensions", value: product.length && product.width && product.height ? `${product.length}L × ${product.width}W × ${product.height}H` : null },
    { label: "Type", value: product.type?.value },
    { label: "Country of Origin", value: product.origin_country },
    { label: "SKU", value: product.sku },
    { label: "Barcode", value: product.ean },
    { label: "Status", value: product.status },
  ]

  const availableSpecs = specs.filter((spec) => spec.value)

  return (
    <div className="text-small-regular py-8">
      {availableSpecs.length === 0 ? (
        <p className="text-slate-500">No specifications available.</p>
      ) : (
        <div className="grid grid-cols-1 small:grid-cols-2 gap-8">
          {availableSpecs.map((spec, index) => (
            <div key={index} className="flex flex-col gap-2">
              <span className="font-semibold text-slate-900">{spec.label}</span>
              <p className="text-slate-700">{spec.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Product Variants Section */}
      {product.variants && product.variants.length > 0 && (
        <div className="mt-8 pt-8 border-t border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-4">Available Variants</h4>
          <div className="space-y-3">
            {product.variants.slice(0, 5).map((variant) => (
              <div
                key={variant.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {variant.title || "Variant"}
                  </p>
                  {variant.options && variant.options.length > 0 && (
                    <p className="text-xs text-slate-600">
                      {variant.options.map((opt) => opt.value).join(", ")}
                    </p>
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    variant.manage_inventory && (variant.inventory_quantity || 0) > 0
                      ? "text-green-600"
                      : "text-slate-500"
                  }`}
                >
                  {variant.manage_inventory
                    ? `${variant.inventory_quantity || 0} in stock`
                    : "Available"}
                </span>
              </div>
            ))}
            {product.variants.length > 5 && (
              <p className="text-sm text-slate-600 text-center pt-2">
                And {product.variants.length - 5} more variants
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const ReviewsTab = () => {
  return (
    <div className="py-8">
      <ReviewsSection />
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-4">
          <div className="flex-shrink-0 text-2xl">📦</div>
          <div>
            <span className="font-semibold text-slate-900">Fast Delivery</span>
            <p className="max-w-sm text-slate-700 mt-1">
              Your package will arrive in 3-5 business days at your pick-up
              location or in the comfort of your home.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-4">
          <div className="flex-shrink-0 text-2xl">🔄</div>
          <div>
            <span className="font-semibold text-slate-900">Simple Exchanges</span>
            <p className="max-w-sm text-slate-700 mt-1">
              Is the fit not quite right? No worries - we'll exchange your
              product for a new one.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-4">
          <div className="flex-shrink-0 text-2xl">↩️</div>
          <div>
            <span className="font-semibold text-slate-900">Easy Returns</span>
            <p className="max-w-sm text-slate-700 mt-1">
              Just return your product and we'll refund your money. No
              questions asked – we'll do our best to make sure your return
              is hassle-free.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h4 className="font-semibold text-slate-900 mb-4">Returns Policy</h4>
          <ul className="space-y-2 text-slate-700">
            <li className="flex gap-2">
              <span>✓</span>
              <span>30-day return window from purchase date</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Free return shipping on all orders</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Full refund within 5-7 business days after return receipt</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Exchanges available for different sizes or colors</span>
            </li>
          </ul>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h4 className="font-semibold text-slate-900 mb-4">Shipping Information</h4>
          <ul className="space-y-2 text-slate-700">
            <li className="flex gap-2">
              <span>•</span>
              <span>Standard shipping: 3-5 business days</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Express shipping: 1-2 business days (available at checkout)</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Free shipping on orders over $50</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>All orders include tracking</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
