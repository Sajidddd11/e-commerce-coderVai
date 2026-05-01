import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { upstashRedis } from "../../../lib/redis/upstash"

const CACHE_KEY = "best_selling_products_v4"
const CACHE_DURATION = 24 * 60 * 60 // 24 hours in seconds

interface ProductSalesCount {
    product_id: string
    variant_id: string
    sales_count: number
}

/**
 * GET /store/best-selling
 * Returns product IDs sorted by sales count (most sold first)
 * Cached for 24 hours in Redis
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        // Try to get from cache first
        const cached = await upstashRedis.get<ProductSalesCount[]>(CACHE_KEY)

        if (cached && cached.length > 0) {
            console.log('[Best Selling] ✅ Returning cached data')
            return res.json({
                products: cached,
                cached: true,
                count: cached.length
            })
        }

        // Cache miss - query database
        console.log('[Best Selling] 📊 Cache miss - querying database...')

        const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

        // Query to get product sales counts from completed orders
        // Medusa v2 structure: order -> order_item -> order_line_item -> product
        const salesData = await pgConnection.raw(`
      SELECT 
        oli.product_id,
        oli.variant_id,
        SUM(oi.quantity) as sales_count
      FROM order_line_item oli
      INNER JOIN order_item oi ON oli.id = oi.item_id
      INNER JOIN "order" o ON oi.order_id = o.id
      INNER JOIN product p ON oli.product_id = p.id
      WHERE o.status NOT IN ('canceled')
        AND oli.product_id IS NOT NULL
        AND oi.deleted_at IS NULL
        AND oli.deleted_at IS NULL
        AND o.deleted_at IS NULL
        AND p.deleted_at IS NULL
        AND p.status = 'published'
      GROUP BY oli.product_id, oli.variant_id
      ORDER BY sales_count DESC
      LIMIT 100
    `)

        const productSales: ProductSalesCount[] = salesData.rows.map((row: any) => ({
            product_id: row.product_id,
            variant_id: row.variant_id,
            sales_count: parseInt(row.sales_count, 10),
        }))

        // Cache the results
        if (productSales.length > 0) {
            await upstashRedis.set(CACHE_KEY, productSales, CACHE_DURATION)
            console.log(`[Best Selling] ✅ Cached ${productSales.length} products for ${CACHE_DURATION}s`)
        }

        return res.json({
            products: productSales,
            cached: false,
            count: productSales.length
        })
    } catch (error: any) {
        console.error('[Best Selling] ❌ Error:', error)
        return res.status(500).json({
            message: error?.message ?? 'Failed to fetch best selling products',
            products: [],
            count: 0
        })
    }
}
