"use client"

import { Table, Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import QuantityRegulator from "@modules/cart/components/quantity-regulator"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import DotSpinner from "@modules/common/components/dot-spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
  renderMode?: "desktop" | "mobile"
}

const Item = ({ item, type = "full", currencyCode, renderMode = "desktop" }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  if (renderMode === "mobile") {
    return (
      <div className="w-full border border-ui-border-base rounded-lg p-4 mb-4 bg-ui-bg-base">
        <div className="flex gap-3">
          <LocalizedClientLink
            href={`/products/${item.product_handle}`}
            className="flex-shrink-0"
          >
            <Thumbnail
              thumbnail={item.thumbnail}
              images={item.variant?.product?.images}
              size="square"
            />
          </LocalizedClientLink>

          <div className="flex-1 min-w-0">
            <Text
              className="txt-medium-plus text-ui-fg-base break-words"
              data-testid="product-title"
            >
              {item.product_title}
            </Text>
            <LineItemOptions variant={item.variant} data-testid="product-variant" />

            <div className="mt-2">
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-ui-border-base">
          <div className="flex gap-2 items-center">
            <QuantityRegulator
              quantity={item.quantity}
              onChange={changeQuantity}
              maxQuantity={maxQuantity}
              disabled={updating}
              data-testid="product-quantity-button"
            />
            <DeleteButton id={item.id} data-testid="product-delete-button" />
            {updating && <DotSpinner size="sm" color="#262626" />}
          </div>

          <div className="text-right">
            <LineItemPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </div>
        </div>

        <ErrorMessage error={error} data-testid="product-error-message" />
      </div>
    )
  }

  return (
    <>
      {/* Desktop/Table View */}
      <Table.Row className="w-full" data-testid="product-row">
        <Table.Cell className="!pl-0 p-4 w-24">
          <LocalizedClientLink
            href={`/products/${item.product_handle}`}
            className={clx("flex", {
              "w-16": type === "preview",
              "small:w-24 w-12": type === "full",
            })}
          >
            <Thumbnail
              thumbnail={item.thumbnail}
              images={item.variant?.product?.images}
              size="square"
            />
          </LocalizedClientLink>
        </Table.Cell>

        <Table.Cell className="text-left">
          <Text
            className="txt-medium-plus text-ui-fg-base"
            data-testid="product-title"
          >
            {item.product_title}
          </Text>
          <LineItemOptions variant={item.variant} data-testid="product-variant" />
        </Table.Cell>

        {type === "full" && (
          <Table.Cell>
            <div className="flex gap-2 items-center">
              <QuantityRegulator
                quantity={item.quantity}
                onChange={changeQuantity}
                maxQuantity={maxQuantity}
                disabled={updating}
                data-testid="product-quantity-button"
              />
              <DeleteButton id={item.id} data-testid="product-delete-button" />
              {updating && <DotSpinner size="sm" color="#262626" />}
            </div>
            <ErrorMessage error={error} data-testid="product-error-message" />
          </Table.Cell>
        )}

        {type === "full" && (
          <Table.Cell className="hidden small:table-cell">
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </Table.Cell>
        )}

        <Table.Cell className="!pr-0">
          <span
            className={clx("!pr-0", {
              "flex flex-col items-end h-full justify-center": type === "preview",
            })}
          >
            {type === "preview" && (
              <span className="flex gap-x-1 ">
                <Text className="text-ui-fg-muted">{item.quantity}x </Text>
                <LineItemUnitPrice
                  item={item}
                  style="tight"
                  currencyCode={currencyCode}
                />
              </span>
            )}
            <LineItemPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </span>
        </Table.Cell>
      </Table.Row>
    </>
  )
}

export default Item
