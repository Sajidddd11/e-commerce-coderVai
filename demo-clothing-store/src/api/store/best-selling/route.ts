import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, QueryContext } from "@medusajs/framework/utils"
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
 * Returns full products sorted by sales count (most sold first)
 * The sales ID mapping is cached for 24 hours in Redis.
 * The full products (with calculated prices for the region) are resolved dynamically on each request.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const regionId = req.query.region_id as string | undefined
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10

        // Try to get from cache first
        let productSales = await upstashRedis.get<ProductSalesCount[]>(CACHE_KEY)

        if (!productSales || productSales.length === 0) {
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

            productSales = salesData.rows.map((row: any) => ({
                product_id: row.product_id,
                variant_id: row.variant_id,
                sales_count: parseInt(row.sales_count, 10),
            }))

            // Cache the results
            if (productSales && productSales.length > 0) {
                await upstashRedis.set(CACHE_KEY, productSales, CACHE_DURATION)
                console.log(`[Best Selling] ✅ Cached ${productSales.length} products for ${CACHE_DURATION}s`)
            }
        } else {
            console.log('[Best Selling] ✅ Returning cached sales data')
        }

        if (!productSales || productSales.length === 0) {
            return res.json({
                products: [],
                count: 0
            })
        }

        // Get unique product IDs in order of sales count
        const uniqueProductIds = Array.from(
            new Set(productSales.map((ps) => ps.product_id))
        ).slice(0, limit)

        if (uniqueProductIds.length === 0) {
            return res.json({
                products: [],
                count: 0
            })
        }

        // Fetch full products from Query engine
        const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

        // Resolve region and currency code for pricing context
        let resolvedRegionId = regionId
        let currencyCode: string | undefined = undefined

        const regionFilters = resolvedRegionId ? { id: resolvedRegionId } : {}
        const { data: regions } = await query.graph({
            entity: "region",
            fields: ["id", "currency_code"],
            filters: regionFilters,
            pagination: { take: 1 }
        })

        if (regions && regions.length > 0) {
            resolvedRegionId = regions[0].id
            currencyCode = regions[0].currency_code
        }

        const { data: products } = await query.graph({
            entity: "product",
            fields: [
                "id",
                "title",
                "subtitle",
                "description",
                "handle",
                "thumbnail",
                "status",
                "created_at",
                "variants.id",
                "variants.title",
                "variants.sku",
                "variants.manage_inventory",
                "variants.inventory_quantity",
                "variants.calculated_price.*",
                "images.id",
                "images.url",
                "categories.id",
                "categories.name",
                "categories.handle",
                "collection.id",
                "collection.title",
                "collection.handle"
            ],
            filters: {
                id: uniqueProductIds,
                status: "published"
            },
            context: {
                variants: {
                    calculated_price: QueryContext({
                        region_id: resolvedRegionId,
                        currency_code: currencyCode
                    })
                }
            }
        })

        // Sort products according to the rank in uniqueProductIds
        const productMap = new Map<string, any>(products.map((p: any) => [p.id, p]))
        const sortedProducts = uniqueProductIds
            .map((id) => productMap.get(id))
            .filter((p): p is any => p !== undefined)

        return res.json({
            products: sortedProducts,
            count: sortedProducts.length
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
