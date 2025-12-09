import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const orderModuleService = req.scope.resolve(Modules.ORDER)
    
    const { limit = 20, offset = 0 } = req.query

    // According to schema.sql:
    // - order table has shipping_address_id and billing_address_id (FKs to order_address)
    // - order_address table has: address_1, address_2, city, province, postal_code, country_code, phone, first_name, last_name, company
    
    // List orders with address relations
    // Try with relations first
    let orders: any[]
    let count: number

    try {
      [orders, count] = await orderModuleService.listAndCountOrders(
        {},
        {
          take: Number(limit),
          skip: Number(offset),
          order: { created_at: "DESC" },
          relations: ["shipping_address", "billing_address", "summary"],
        }
      )
    } catch (relationError) {
      // If relations don't work, fetch orders and then fetch addresses separately
      [orders, count] = await orderModuleService.listAndCountOrders(
        {},
        {
          take: Number(limit),
          skip: Number(offset),
          order: { created_at: "DESC" },
        }
      )

      // Fetch addresses and summary for orders that have address IDs
      orders = await Promise.all(
        orders.map(async (order: any) => {
          const result: any = { ...order }
          
          // Fetch full order with relations
          try {
            const fullOrder = await orderModuleService.retrieveOrder(order.id, {
              relations: ["shipping_address", "billing_address", "summary"],
            })
            result.shipping_address = fullOrder.shipping_address || null
            result.billing_address = fullOrder.billing_address || null
            result.summary = fullOrder.summary || null
          } catch (e) {
            // If that fails, try individual fetches
            if (order.shipping_address_id) {
              try {
                const orderWithShipping = await orderModuleService.retrieveOrder(order.id, {
                  relations: ["shipping_address"],
                })
                result.shipping_address = orderWithShipping.shipping_address || null
              } catch (e2) {
                result.shipping_address = null
              }
            }

            if (order.billing_address_id) {
              try {
                const orderWithBilling = await orderModuleService.retrieveOrder(order.id, {
                  relations: ["billing_address"],
                })
                result.billing_address = orderWithBilling.billing_address || null
              } catch (e2) {
                result.billing_address = null
              }
            }
          }

          return result
        })
      )
    }

    return res.status(200).json({
      orders,
      count,
      limit: Number(limit),
      offset: Number(offset),
    })
  } catch (error: any) {
    console.error("Error fetching orders:", error)
    return res.status(500).json({
      message: error?.message ?? "Failed to fetch orders",
    })
  }
}

