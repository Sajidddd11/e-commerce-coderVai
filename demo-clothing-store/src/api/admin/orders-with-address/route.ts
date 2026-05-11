import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const orderModuleService = req.scope.resolve(Modules.ORDER)
    const remoteQuery = req.scope.resolve("remoteQuery")

    const {
      limit = 20,
      offset = 0,
      search,
      date_range,
      payment_method,
      status,
      payment_status,
    } = req.query

    const parsedLimit = Math.min(Number(limit), 100) // hard cap per page
    const parsedOffset = Number(offset)

    // ── 1. DB-level filters ──────────────────────────────────────────
    // These are applied directly in the SQL query so we never over-fetch.
    const dbFilters: any = {}

    // Date range → created_at filter
    if (date_range && date_range !== 'all') {
      const now = new Date()
      let startDate: Date
      switch (date_range) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case 'month':
          startDate = new Date(now.setDate(now.getDate() - 30))
          break
        default:
          startDate = new Date(0)
      }
      dbFilters.created_at = { $gte: startDate }
    }

    // Display-ID search: if the search term is a pure number, filter directly in DB
    const searchStr = search ? String(search).trim() : ''
    const isNumericSearch = searchStr !== '' && /^\d+$/.test(searchStr)
    if (isNumericSearch) {
      dbFilters.display_id = Number(searchStr)
    }

    // custom_status: Medusa stores metadata as JSONB (PostgreSQL).
    // We can filter on it using the $like operator on the raw column.
    // Medusa's ORM exposes metadata as a plain filter.
    if (status && status !== 'all') {
      dbFilters['metadata->custom_status'] = String(status)
    }

    // ── 2. Determine whether we need the payment fan-out ────────────
    // payment_method and payment_status can only be resolved after we
    // fetch payment data from the payment module.  When either is active
    // we must fetch more rows than one page, filter, then re-slice.
    const needsPaymentFilter =
      (payment_method && payment_method !== 'all') ||
      (payment_status && payment_status !== 'all')

    // ── 3. Fetch orders from DB ──────────────────────────────────────
    // Without payment filter:  ask DB for exactly the page we need.
    // With payment filter:     fetch a bounded window to filter in-memory.
    //                          200 rows is safe — in the worst case this
    //                          is one HTTP request, one DB query, and a
    //                          small remoteQuery batch.
    const PAYMENT_FILTER_WINDOW = 200

    let orders: any[]
    let dbCount: number

    const dbOptions: any = {
      skip: needsPaymentFilter ? 0 : parsedOffset,
      take: needsPaymentFilter ? PAYMENT_FILTER_WINDOW : parsedLimit,
      order: { created_at: "DESC" },
      relations: ["shipping_address", "billing_address", "summary"],
    }

    try {
      ;[orders, dbCount] = await orderModuleService.listAndCountOrders(
        dbFilters,
        dbOptions
      )
    } catch {
      // Relations failed — fall back to plain fetch then hydrate addresses
      ;[orders, dbCount] = await orderModuleService.listAndCountOrders(
        dbFilters,
        { ...dbOptions, relations: [] }
      )
      orders = await Promise.all(
        orders.map(async (order: any) => {
          try {
            const full = await orderModuleService.retrieveOrder(order.id, {
              relations: ["shipping_address", "billing_address", "summary"],
            })
            return {
              ...order,
              shipping_address: full.shipping_address || null,
              billing_address: full.billing_address || null,
              summary: full.summary || null,
            }
          } catch {
            return order
          }
        })
      )
    }

    // ── 4. In-memory text search (name / phone / email) ─────────────
    // Only needed when the search term is not a pure display_id number.
    if (searchStr && !isNumericSearch) {
      const lower = searchStr.toLowerCase()
      orders = orders.filter(o => {
        const displayId = String(o.display_id || '')
        const email = String(o.email || '').toLowerCase()
        const sp = String(o.shipping_address?.phone || '').toLowerCase()
        const bp = String(o.billing_address?.phone || '').toLowerCase()
        const sn = `${o.shipping_address?.first_name || ''} ${o.shipping_address?.last_name || ''}`.toLowerCase()
        const bn = `${o.billing_address?.first_name || ''} ${o.billing_address?.last_name || ''}`.toLowerCase()
        return (
          displayId.includes(lower) ||
          email.includes(lower) ||
          sp.includes(lower) ||
          bp.includes(lower) ||
          sn.includes(lower) ||
          bn.includes(lower)
        )
      })
    }

    // ── 5. Enrich with payment data (only if visible or filtered on) ─
    if (orders.length > 0) {
      try {
        const orderIds = orders.map(o => o.id)

        const paymentLinks = await remoteQuery({
          entryPoint: "order_payment_collection",
          fields: ["order_id", "payment_collection_id"],
          variables: { filters: { order_id: orderIds } },
        })

        const collectionIds = paymentLinks
          .map((p: any) => p.payment_collection_id)
          .filter(Boolean)

        if (collectionIds.length > 0) {
          const [payments, paymentCollections] = await Promise.all([
            remoteQuery({
              entryPoint: "payment",
              fields: ["id", "provider_id", "payment_collection_id"],
              variables: { filters: { payment_collection_id: collectionIds } },
            }),
            remoteQuery({
              entryPoint: "payment_collection",
              fields: ["id", "status"],
              variables: { filters: { id: collectionIds } },
            }),
          ])

          const providerMap: Record<string, string> = {}
          const statusMap: Record<string, string> = {}

          paymentLinks.forEach((link: any) => {
            const pay = payments.find(
              (p: any) => p.payment_collection_id === link.payment_collection_id
            )
            const col = paymentCollections.find(
              (pc: any) => pc.id === link.payment_collection_id
            )
            if (pay) providerMap[link.order_id] = pay.provider_id
            if (col) statusMap[link.order_id] = col.status
          })

          orders = orders.map(o => ({
            ...o,
            payment_provider: providerMap[o.id] || null,
            payment_status: statusMap[o.id] || null,
          }))
        }
      } catch (paymentError) {
        console.warn("Could not fetch payment data:", paymentError)
      }
    }

    // ── 6. Payment-module in-memory filters ─────────────────────────
    if (payment_method && payment_method !== 'all') {
      orders = orders.filter(o => o.payment_provider === payment_method)
    }
    if (payment_status && payment_status !== 'all') {
      orders = orders.filter(o => o.payment_status === payment_status)
    }

    // ── 7. Count + paginate ──────────────────────────────────────────
    // Without payment filter: dbCount already reflects DB-level filters;
    //   no in-memory slice needed (DB already returned the right page).
    // With payment filter:    we filtered a window in memory, so we use
    //   the in-memory length as the count and slice manually.
    let finalCount: number
    let finalOrders: any[]

    if (needsPaymentFilter) {
      finalCount = orders.length
      finalOrders = orders.slice(parsedOffset, parsedOffset + parsedLimit)
    } else {
      // In-memory text search may have shrunk the list; use that count
      finalCount = searchStr && !isNumericSearch ? orders.length : dbCount
      finalOrders = orders // already the correct page from DB
    }

    return res.status(200).json({
      orders: finalOrders,
      count: finalCount,
      limit: parsedLimit,
      offset: parsedOffset,
    })
  } catch (error: any) {
    console.error("Error fetching orders:", error)
    return res.status(500).json({
      message: error?.message ?? "Failed to fetch orders",
    })
  }
}
