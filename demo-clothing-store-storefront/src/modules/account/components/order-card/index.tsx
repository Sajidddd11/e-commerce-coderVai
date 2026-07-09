import { Button } from "@medusajs/ui"
import { useMemo } from "react"

import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

// Status colors matching the order detail page and mobile app exactly
const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  pending:    { bg: "bg-slate-100",   text: "text-slate-600",  dot: "bg-slate-400" },
  processing: { bg: "bg-teal-50",     text: "text-teal-600",   dot: "bg-teal-500" },
  shipped:    { bg: "bg-blue-50",     text: "text-blue-600",   dot: "bg-blue-500" },
  delivered:  { bg: "bg-emerald-50",  text: "text-emerald-600",dot: "bg-emerald-500" },
  refunded:   { bg: "bg-amber-50",    text: "text-amber-600",  dot: "bg-amber-500" },
  canceled:   { bg: "bg-red-50",      text: "text-red-600",    dot: "bg-red-500" },
}

const OrderCard = ({ order }: OrderCardProps) => {
  // Read custom_status from metadata first (same as mobile + order detail page)
  const customStatus: string =
    (order.metadata as any)?.custom_status || order.status || "pending"

  const statusStyle = STATUS_STYLE[customStatus] ?? STATUS_STYLE.pending
  const statusLabel = customStatus.charAt(0).toUpperCase() + customStatus.slice(1)

  const numberOfLines = useMemo(() => {
    return (
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0
    )
  }, [order])

  const numberOfProducts = useMemo(() => {
    return order.items?.length ?? 0
  }, [order])

  return (
    <div className="bg-white flex flex-col gap-y-3" data-testid="order-card">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-slate-900" data-testid="order-display-id">
            #{order.display_id}
          </span>
          {/* Custom status badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {statusLabel}
          </span>
        </div>
        <span className="text-sm text-slate-500" data-testid="order-created-at">
          {new Date(order.created_at).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Meta & Button row */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <div className="flex items-center gap-x-3">
          <span data-testid="order-amount" className="font-medium text-slate-700">
            {convertToLocale({
              amount: order.total,
              currency_code: order.currency_code,
            })}
          </span>
          <span className="text-slate-300">·</span>
          <span>{`${numberOfLines} ${numberOfLines > 1 ? "items" : "item"}`}</span>
        </div>
        <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
          <Button data-testid="order-details-link" variant="secondary" size="small">
            See details
          </Button>
        </LocalizedClientLink>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-4 my-2">
        {order.items?.slice(0, 3).map((i) => {
          const handle = i.product?.handle || i.variant?.product?.handle
          
          const thumbnailElement = (
            <div className="w-20 h-20 shrink-0 overflow-hidden rounded-lg">
              <Thumbnail thumbnail={i.thumbnail} images={[]} size="small" />
            </div>
          )
          const textElement = (
            <div className="flex items-center text-xs text-slate-600 mt-1 max-w-[80px]">
              <span className={`font-medium truncate ${handle ? 'hover:text-blue-600 transition-colors' : ''}`} data-testid="item-title">
                {i.title}
              </span>
              <span className="ml-1 text-slate-400 shrink-0">x{i.quantity}</span>
            </div>
          )

          return (
            <div key={i.id} className="flex flex-col w-20" data-testid="order-item">
              {handle ? (
                <LocalizedClientLink href={`/products/${handle}`} className="flex flex-col">
                  {thumbnailElement}
                  {textElement}
                </LocalizedClientLink>
              ) : (
                <>
                  {thumbnailElement}
                  {textElement}
                </>
              )}
            </div>
          )
        })}
        {numberOfProducts > 3 && (
          <div className="w-20 h-20 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-xs text-slate-400 bg-slate-50 shrink-0">
            <span>+{numberOfLines - 3}</span>
            <span>more</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderCard
