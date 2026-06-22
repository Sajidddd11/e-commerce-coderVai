import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, QueryContext } from "@medusajs/framework/utils"
import { RECOMMENDATION_MODULE } from "../../../modules/recommendation"
import type RecommendationModuleService from "../../../modules/recommendation/service"
import { upstashRedis } from "../../../lib/redis/upstash"
import { randomUUID } from "crypto"

// ─── Cache TTLs ───────────────────────────────────────────────────────────────
const CACHE_TTL_TRENDING      = 60 * 60        // 1 hour
const CACHE_TTL_PERSONALISED  = 60 * 30        // 30 minutes per user
const CACHE_TTL_BOUGHT_TOGETHER = 60 * 60 * 6  // 6 hours per product

// Minimum events before personalised strategy is used
const MIN_EVENTS_FOR_PERSONALISED = 5

// ─── Product fields returned (matches best-selling pattern) ──────────────────
const PRODUCT_FIELDS = [
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
    "images.id",
    "images.url",
    "categories.id",
    "categories.name",
    "categories.handle",
    "collection.id",
    "collection.title",
    "collection.handle",
]

/**
 * GET /store/recommendations
 *
 * Returns a "Suggested For You" product list using the best available strategy:
 *
 *   personalised   → Strategy 1: products from user's top categories (5+ events)
 *   bought_together → Strategy 2: products frequently bought with a given product
 *   trending        → Strategy 3: most interacted-with products in the last 7 days
 *   auto (default)  → picks the best strategy based on available data
 *
 * Query params:
 *   session_id      string   (required)
 *   customer_id?    string
 *   fingerprint_id? string
 *   product_id?     string   (required for bought_together)
 *   type?           'auto' | 'personalised' | 'trending' | 'bought_together'
 *   limit?          number   (default 10)
 *   region_id?      string   (for calculated prices)
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const {
            session_id,
            customer_id,
            fingerprint_id,
            product_id,
            type = "auto",
            region_id,
        } = req.query as Record<string, string>

        const limit = parseInt((req.query.limit as string) ?? "10", 10)

        if (!session_id) {
            return res.status(400).json({ message: "session_id is required" })
        }

        const recommendationService: RecommendationModuleService =
            req.scope.resolve(RECOMMENDATION_MODULE)

        const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

        // ── Resolve region/currency ───────────────────────────────────────────
        let resolvedRegionId = region_id
        let currencyCode: string | undefined

        if (resolvedRegionId) {
            const { data: regions } = await query.graph({
                entity: "region",
                fields: ["id", "currency_code"],
                filters: { id: resolvedRegionId },
                pagination: { take: 1 },
            })
            if (regions?.length > 0) {
                resolvedRegionId = regions[0].id
                currencyCode = regions[0].currency_code
            }
        }

        // ── Determine which strategy to use ──────────────────────────────────
        let strategy = type
        let productIds: string[] = []

        if (type === "auto" || type === "personalised") {
            // Check if user has enough data for personalised recommendations
            const eventCount = await recommendationService.countUserEvents({
                customer_id:    customer_id    || undefined,
                session_id:     session_id     || undefined,
                fingerprint_id: fingerprint_id || undefined,
            })

            if (eventCount >= MIN_EVENTS_FOR_PERSONALISED) {
                strategy = "personalised"
            } else if (type === "auto") {
                strategy = eventCount > 0 ? "mixed" : "trending"
            }
        }

        // ── Generate a unique recomm_id for this response ─────────────────────
        // Clients should include this recomm_id when tracking clicks on results
        const recommId = randomUUID()

        // ─────────────────────────────────────────────────────────────────────
        // STRATEGY EXECUTION
        // ─────────────────────────────────────────────────────────────────────

        if (strategy === "bought_together") {
            if (!product_id) {
                return res.status(400).json({ message: "product_id is required for bought_together" })
            }

            const cacheKey = `recommendations:bought_together:${product_id}:${limit}`
            const cached = await upstashRedis.get<string[]>(cacheKey)
            if (cached) {
                productIds = cached
            } else {
                productIds = await recommendationService.getBoughtTogether({ product_id, limit })
                if (productIds.length > 0) {
                    await upstashRedis.set(cacheKey, productIds, CACHE_TTL_BOUGHT_TOGETHER)
                }
            }
            // Fall through to trending if no bought-together data yet
            if (productIds.length === 0) strategy = "trending"
        }

        if (strategy === "personalised") {
            const userId = customer_id || fingerprint_id || session_id
            const cacheKey = `recommendations:personalised:${userId}:${limit}`
            const cached = await upstashRedis.get<string[]>(cacheKey)
            if (cached) {
                productIds = cached
            } else {
                productIds = await recommendationService.getPersonalised({
                    customer_id:    customer_id    || undefined,
                    session_id:     session_id     || undefined,
                    fingerprint_id: fingerprint_id || undefined,
                    limit,
                })
                if (productIds.length > 0) {
                    await upstashRedis.set(cacheKey, productIds, CACHE_TTL_PERSONALISED)
                }
            }
            // Fall through to trending if not enough personalised results
            if (productIds.length < Math.ceil(limit / 2)) strategy = "trending"
        }

        if (strategy === "mixed") {
            // Few events: blend some personalised + trending
            const [personalisedIds, trendingIds] = await Promise.all([
                recommendationService.getPersonalised({
                    customer_id:    customer_id    || undefined,
                    session_id:     session_id     || undefined,
                    fingerprint_id: fingerprint_id || undefined,
                    limit:          Math.ceil(limit * 0.6),
                }),
                recommendationService.getTrending({ limit: Math.ceil(limit * 0.6) }),
            ])
            const seen = new Set<string>()
            for (const id of [...personalisedIds, ...trendingIds]) {
                if (!seen.has(id)) {
                    seen.add(id)
                    productIds.push(id)
                }
                if (productIds.length >= limit) break
            }
            strategy = "mixed" // label as mixed
        }

        if (strategy === "trending" || productIds.length === 0) {
            strategy = "trending"
            const cacheKey = `recommendations:trending:${limit}`
            const cached = await upstashRedis.get<string[]>(cacheKey)
            if (cached) {
                productIds = cached
            } else {
                productIds = await recommendationService.getTrending({ limit })
                if (productIds.length > 0) {
                    await upstashRedis.set(cacheKey, productIds, CACHE_TTL_TRENDING)
                }
            }
        }

        // ── Cold-start fallback ───────────────────────────────────────────────
        // No behaviour events yet (brand new DB). Show newest published products
        // so the "Suggested For You" / "Trending" section always renders.
        if (productIds.length === 0) {
            strategy = "trending"
            const cacheKey = `recommendations:cold_start:${limit}`
            const cachedCold = await upstashRedis.get<any[]>(cacheKey)

            if (cachedCold && cachedCold.length > 0) {
                return res.json({
                    products:  cachedCold,
                    strategy,
                    count:     cachedCold.length,
                    recomm_id: recommId,
                })
            }

            const fields = [...PRODUCT_FIELDS]
            if (resolvedRegionId && currencyCode) {
                fields.push("variants.calculated_price.*")
            }

            // Fetch newest products directly — no behaviour data needed
            const { data: coldProducts } = await query.graph({
                entity: "product",
                fields,
                filters: { status: "published" },
                pagination: {
                    take:  limit,
                    order: { created_at: "DESC" } as any,
                },
                ...(resolvedRegionId && currencyCode && {
                    context: {
                        variants: {
                            calculated_price: QueryContext({
                                region_id:     resolvedRegionId,
                                currency_code: currencyCode,
                            }),
                        },
                    },
                }),
            })

            if (coldProducts && coldProducts.length > 0) {
                await upstashRedis.set(cacheKey, coldProducts, 60 * 30) // 30 min cache
                return res.json({
                    products:  coldProducts,
                    strategy,
                    count:     coldProducts.length,
                    recomm_id: recommId,
                })
            }

            return res.json({ products: [], strategy, count: 0, recomm_id: recommId })
        }

        const fields = [...PRODUCT_FIELDS]
        if (resolvedRegionId && currencyCode) {
            fields.push("variants.calculated_price.*")
        }

        // ── Fetch full product objects from Medusa ────────────────────────────
        const { data: products } = await query.graph({
            entity: "product",
            fields,
            filters: {
                id:     productIds,
                status: "published",
            },
            ...(resolvedRegionId && currencyCode && {
                context: {
                    variants: {
                        calculated_price: QueryContext({
                            region_id:     resolvedRegionId,
                            currency_code: currencyCode,
                        }),
                    },
                },
            }),
        })

        // Preserve the order returned by the recommendation strategy
        const productMap = new Map<string, any>(
            (products as any[]).map(p => [p.id, p])
        )
        const sortedProducts = productIds
            .map(id => productMap.get(id))
            .filter((p): p is any => p !== undefined)

        return res.json({
            products: sortedProducts,
            strategy,
            count:    sortedProducts.length,
            recomm_id: recommId, // client should include this when tracking clicks
        })
    } catch (error: any) {
        console.error("[Recommendations] ❌ Error:", error)
        return res.status(500).json({
            message:  error?.message ?? "Failed to fetch recommendations",
            products: [],
            count:    0,
        })
    }
}
