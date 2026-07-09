"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import OrderReviewModal from "@modules/order/components/order-review-modal"
import { convertToLocale } from "@lib/util/money"
import React, { useState } from "react"
import {
  Star,
  ShieldCheck,
  ChevronLeft,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Check,
} from "lucide-react"

// ─── Status / tracking config (mirrors mobile exactly) ────────────────────────

type TrackingStep = {
  key: string
  label: string
  description: string
  Icon: React.ElementType
}

const TRACKING_STEPS: TrackingStep[] = [
  { key: "pending",    label: "Order Placed",  description: "Your order has been received",   Icon: Clock },
  { key: "processing", label: "Processing",    description: "We are preparing your items",    Icon: Package },
  { key: "shipped",    label: "Shipped",       description: "Your order is on the way",       Icon: Truck },
  { key: "delivered",  label: "Delivered",     description: "Order successfully delivered",   Icon: CheckCircle },
]

const CANCELLED_STEPS: TrackingStep[] = [
  { key: "pending",  label: "Order Placed", description: "Your order was received",         Icon: Clock },
  { key: "canceled", label: "Cancelled",    description: "This order has been cancelled",   Icon: XCircle },
]

const REFUNDED_STEPS: TrackingStep[] = [
  { key: "pending",  label: "Order Placed", description: "Your order was received",       Icon: Clock },
  { key: "refunded", label: "Refunded",     description: "Refund has been processed",     Icon: RefreshCw },
]

function getStepsForStatus(status: string) {
  if (status === "canceled") return CANCELLED_STEPS
  if (status === "refunded") return REFUNDED_STEPS
  return TRACKING_STEPS
}

function getActiveStepIndex(status: string, steps: TrackingStep[]) {
  const idx = steps.findIndex((s) => s.key === status)
  return idx === -1 ? 0 : idx
}

type StepColors = { active: string; muted: string; text: string }

function getStepColors(status: string): StepColors {
  if (status === "canceled") return { active: "#EF4444", muted: "#FEE2E2", text: "text-red-500" }
  if (status === "refunded") return { active: "#F59E0B", muted: "#FEF3C7", text: "text-amber-500" }
  if (status === "delivered") return { active: "#10B981", muted: "#D1FAE5", text: "text-emerald-500" }
  return { active: "#56AEBF", muted: "rgba(86,174,191,0.12)", text: "text-teal-500" }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
  customer?: { first_name?: string; last_name?: string; email?: string } | null
  reviewedProductIds?: string[]
}

const ELIGIBLE_STATUSES = ["delivered", "refunded"]

// ─── Component ────────────────────────────────────────────────────────────────

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
  customer,
  reviewedProductIds,
}) => {
  // Always read the custom status from metadata first (same as mobile)
  const customStatus: string =
    (order.metadata as any)?.custom_status || order.status || "pending"

  const steps = getStepsForStatus(customStatus)
  const activeIndex = getActiveStepIndex(customStatus, steps)
  const stepColors = getStepColors(customStatus)

  const isEligibleForReview = ELIGIBLE_STATUSES.includes(customStatus)

  const [activeReview, setActiveReview] = useState<{
    id: string
    title: string
    thumbnail?: string | null
  } | null>(null)
  const [reviewedItems, setReviewedItems] = useState<Set<string>>(
    () => new Set(reviewedProductIds ?? [])
  )

  const currency = order.currency_code || "bdt"

  const customerName =
    customer?.first_name && customer?.last_name
      ? `${customer.first_name} ${customer.last_name}`
      : customer?.first_name ||
        order.shipping_address?.first_name ||
        "Customer"
  const customerEmail = customer?.email || order.email || ""

  return (
    <div className="flex flex-col gap-y-4">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Order #{order.display_id}
        </h1>
        <LocalizedClientLink
          href="/account/orders"
          className="flex gap-1.5 items-center text-sm text-slate-500 hover:text-slate-800 transition-colors"
          data-testid="back-to-overview-button"
        >
          <ChevronLeft size={16} /> Back to orders
        </LocalizedClientLink>
      </div>

      <div className="flex flex-col gap-4 w-full">

        {/* ── Order Status Tracking Card ───────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 gap-4 flex flex-col">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">
              Order date: {new Date(order.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <p className="text-xs text-slate-500">
              Confirmation sent to <span className="font-medium text-slate-700">{order.email}</span>
            </p>
          </div>

          <h2 className="font-semibold text-slate-900">Order Status</h2>

          {/* Tracking steps */}
          <div className="flex flex-col gap-0">
            {steps.map((step, index) => {
              const isCompleted = index < activeIndex
              const isActive = index === activeIndex
              const isLast = index === steps.length - 1
              const { Icon } = step

              const dotBg = isCompleted || isActive ? stepColors.active : "#e2e8f0"
              const iconColor = isCompleted || isActive ? "#fff" : "#94a3b8"
              const lineBg = isCompleted ? stepColors.active : "#e2e8f0"

              return (
                <div key={step.key} className="flex gap-4">
                  {/* Left: dot + connector line */}
                  <div className="flex flex-col items-center w-8">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: dotBg }}
                    >
                      {isCompleted ? (
                        <Check size={13} color="#fff" strokeWidth={3} />
                      ) : (
                        <Icon size={13} color={iconColor} strokeWidth={2.2} />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className="w-0.5 flex-1 mt-1 rounded"
                        style={{ backgroundColor: lineBg, minHeight: "24px" }}
                      />
                    )}
                  </div>

                  {/* Right: text */}
                  <div className={`flex-1 pt-1.5 ${!isLast ? "pb-6" : ""}`}>
                    <p
                      className={`text-sm font-medium ${
                        isActive
                          ? stepColors.text
                          : isCompleted
                          ? "text-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className={`text-xs ${isActive ? "text-slate-600" : "text-slate-400"}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Status pill badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold w-fit"
            style={{ backgroundColor: stepColors.muted, color: stepColors.active }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: stepColors.active }}
            />
            {customStatus.charAt(0).toUpperCase() + customStatus.slice(1)}
          </div>
        </div>

        {/* ── Items Card ──────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-slate-900">Items</h2>
          {order.items
            ?.sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))
            .map((item) => {
              const handle = item.product?.handle || item.variant?.product?.handle

              const thumbnailElement = item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                />
              )

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4"
                  data-testid="product-row"
                >
                  {handle ? (
                    <LocalizedClientLink href={`/products/${handle}`} className="shrink-0 flex w-14">
                      {thumbnailElement}
                    </LocalizedClientLink>
                  ) : (
                    thumbnailElement
                  )}
                  <div className="flex-1 min-w-0">
                    {handle ? (
                      <LocalizedClientLink href={`/products/${handle}`}>
                        <p className="font-medium text-slate-900 text-sm hover:text-blue-600 transition-colors" data-testid="product-name">
                          {item.product_title || item.title}
                        </p>
                      </LocalizedClientLink>
                    ) : (
                      <p className="font-medium text-slate-900 text-sm" data-testid="product-name">
                        {item.product_title || item.title}
                      </p>
                    )}
                    {item.variant?.title && (
                      <p className="text-xs text-slate-500">{item.variant.title}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">Qty {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-slate-900">
                      {convertToLocale({ amount: item.total ?? 0, currency_code: currency })}
                    </p>
                    <p className="text-xs text-slate-400">
                      {convertToLocale({ amount: item.unit_price ?? 0, currency_code: currency })} each
                    </p>
                  </div>
                </div>
              )
            })}
        </div>

        {/* ── Summary Card ────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-3">
          <h2 className="font-semibold text-slate-900">Summary</h2>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>{convertToLocale({ amount: order.subtotal ?? 0, currency_code: currency })}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Shipping</span>
            <span>{convertToLocale({ amount: order.shipping_total ?? 0, currency_code: currency })}</span>
          </div>
          {(order.discount_total ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Discount</span>
              <span>- {convertToLocale({ amount: order.discount_total ?? 0, currency_code: currency })}</span>
            </div>
          )}
          {(order.tax_total ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-slate-600">
              <span>Tax</span>
              <span>{convertToLocale({ amount: order.tax_total ?? 0, currency_code: currency })}</span>
            </div>
          )}
          <div className="h-px bg-slate-200 my-1" />
          <div className="flex justify-between text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{convertToLocale({ amount: order.total ?? 0, currency_code: currency })}</span>
          </div>
          {/* Payment method */}
          {order.payment_collections?.[0]?.payments?.[0]?.provider_id && (
            <p className="text-xs text-slate-400 mt-1">
              Paid via{" "}
              {order.payment_collections[0].payments[0].provider_id
                .replace("pp_", "")
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </p>
          )}
        </div>

        {/* ── Delivery Card ───────────────────────────────────────── */}
        {order.shipping_address && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
            <h2 className="font-semibold text-slate-900">Delivery</h2>
            <div className="grid grid-cols-1 small:grid-cols-3 gap-4">
              {/* Address */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Shipping Address
                </p>
                <p className="text-sm text-slate-700">
                  {order.shipping_address.first_name} {order.shipping_address.last_name}
                </p>
                {order.shipping_address.company && (
                  <p className="text-sm text-slate-500">{order.shipping_address.company}</p>
                )}
                <p className="text-sm text-slate-600">
                  {order.shipping_address.address_1}
                  {order.shipping_address.address_2 && `, ${order.shipping_address.address_2}`}
                </p>
                <p className="text-sm text-slate-600">
                  {order.shipping_address.city}
                  {order.shipping_address.postal_code && `, ${order.shipping_address.postal_code}`}
                </p>
                {order.shipping_address.country_code && (
                  <p className="text-sm text-slate-600">
                    {order.shipping_address.country_code.toUpperCase()}
                  </p>
                )}
              </div>

              {/* Contact */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Contact
                </p>
                {order.shipping_address.phone && (
                  <p className="text-sm text-slate-600">{order.shipping_address.phone}</p>
                )}
                <p className="text-sm text-slate-600">{order.email}</p>
              </div>

              {/* Shipping method */}
              {(order as any).shipping_methods?.[0] && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Method
                  </p>
                  <p className="text-sm text-slate-700">
                    {(order as any).shipping_methods[0]?.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {convertToLocale({
                      amount: (order as any).shipping_methods[0]?.total ?? 0,
                      currency_code: currency,
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Rate Your Items (delivered / refunded only) ──────────── */}
        {isEligibleForReview && (order.items?.length ?? 0) > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Star size={18} className="text-amber-400 fill-amber-400" />
              <h2 className="font-semibold text-slate-900">Rate Your Items</h2>
            </div>
            <p className="text-sm text-slate-500 -mt-2">
              Share your experience with the products you received.
            </p>

            <div className="flex flex-col gap-3">
              {order.items?.map((item) => {
                const productId =
                  (item as any).product_id ||
                  item.product?.id ||
                  item.variant?.product_id
                const alreadyReviewed = productId ? reviewedItems.has(productId) : false

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-slate-50 rounded-lg p-4 border border-slate-100"
                  >
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-12 h-12 rounded-md object-cover bg-slate-100 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">
                        {(item as any).product_title || item.title}
                      </p>
                      {item.variant?.title && (
                        <p className="text-xs text-slate-500">{item.variant.title}</p>
                      )}
                    </div>
                    {alreadyReviewed ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 shrink-0">
                        <ShieldCheck size={14} />
                        Reviewed
                      </span>
                    ) : productId ? (
                      <button
                        onClick={() =>
                          setActiveReview({
                            id: productId,
                            title: (item as any).product_title || item.title || "",
                            thumbnail: item.thumbnail,
                          })
                        }
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-900 text-white hover:bg-slate-700 transition-colors"
                      >
                        <Star size={11} className="fill-white" />
                        Write Review
                      </button>
                    ) : null}
                  </div>
                )
              })}
            </div>

            <div className="flex items-start gap-2 pt-3 border-t border-slate-200">
              <ShieldCheck size={14} className="text-slate-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-400">
                Reviews are verified purchases and appear on product pages after admin approval.
              </p>
            </div>
          </div>
        )}

        {/* ── Help ────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Need help?</h2>
          <div className="flex flex-col gap-2">
            <a
              href="/contact"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors underline underline-offset-2"
            >
              Contact support
            </a>
            <a
              href="/returns"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors underline underline-offset-2"
            >
              Returns & exchanges
            </a>
          </div>
        </div>
      </div>

      {/* ── Review Modal ────────────────────────────────────────────── */}
      {activeReview && (
        <OrderReviewModal
          product={activeReview}
          orderId={order.id}
          customerName={customerName}
          customerEmail={customerEmail}
          onClose={() => setActiveReview(null)}
          onSubmitted={() => {
            setReviewedItems((prev) => {
              const next = new Set(prev)
              next.add(activeReview.id)
              return next
            })
            setActiveReview(null)
          }}
        />
      )}
    </div>
  )
}

export default OrderDetailsTemplate
