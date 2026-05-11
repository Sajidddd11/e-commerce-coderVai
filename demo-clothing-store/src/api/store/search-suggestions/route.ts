import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { upstashRedis } from "../../../lib/redis/upstash"

const CACHE_TTL = 60 * 60 * 6 // 6 hours
const MAX_SUGGESTIONS = 10

interface ProductSuggestion {
    id: string
    title: string
    handle: string
    thumbnail: string | null
    category?: string
    collection?: string
}

interface CategorySuggestion {
    id: string
    name: string
    handle: string
    type: 'category'
}

interface CollectionSuggestion {
    id: string
    title: string
    handle: string
    type: 'collection'
}

interface SearchSuggestionsResponse {
    products: ProductSuggestion[]
    categories: CategorySuggestion[]
    collections: CollectionSuggestion[]
    popular: string[]
}

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const query = req.query.q as string

    // Validate query
    if (!query || query.trim().length < 2) {
        res.json({
            products: [],
            categories: [],
            collections: [],
            popular: []
        })
        return
    }

    const searchQuery = query.trim().toLowerCase()
    const cacheKey = `search:suggestions:${searchQuery}`

    try {
        // Try to get from cache first
        const cached = await upstashRedis.get<SearchSuggestionsResponse>(cacheKey)
        if (cached) {
            console.log(`[Search] Cache hit for: ${searchQuery}`)
            res.json(cached)
            return
        }

        console.log(`[Search] Cache miss for: ${searchQuery}`)

        // Get database query from container
        const query_instance = req.scope.resolve(ContainerRegistrationKeys.QUERY)

        // Search for products
        const { data: products } = await query_instance.graph({
            entity: "product",
            fields: [
                "id",
                "title",
                "handle",
                "thumbnail",
                "categories.id",
                "categories.name",
                "categories.handle",
                "collection.id",
                "collection.title",
                "collection.handle",
            ],
            filters: {
                status: "published",
                $or: [
                    { title: { $ilike: `%${searchQuery}%` } },
                    { handle: { $ilike: `%${searchQuery}%` } },
                ],
            },
            pagination: {
                take: MAX_SUGGESTIONS,
            },
        })

        // Search for categories
        const { data: categories } = await query_instance.graph({
            entity: "product_category",
            fields: ["id", "name", "handle"],
            filters: {
                $or: [
                    { name: { $ilike: `%${searchQuery}%` } },
                    { handle: { $ilike: `%${searchQuery}%` } },
                ],
            },
            pagination: {
                take: 5,
            },
        })

        // Search for collections
        const { data: collections } = await query_instance.graph({
            entity: "product_collection",
            fields: ["id", "title", "handle"],
            filters: {
                $or: [
                    { title: { $ilike: `%${searchQuery}%` } },
                    { handle: { $ilike: `%${searchQuery}%` } },
                ],
            },
            pagination: {
                take: 5,
            },
        })

        // Format product suggestions
        const productSuggestions: ProductSuggestion[] = products.map((product: any) => ({
            id: product.id,
            title: product.title,
            handle: product.handle,
            thumbnail: product.thumbnail,
            category: product.categories?.[0]?.name,
            collection: product.collection?.title,
        }))

        // Format category suggestions
        const categorySuggestions: CategorySuggestion[] = categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            handle: cat.handle,
            type: 'category' as const,
        }))

        // Format collection suggestions
        const collectionSuggestions: CollectionSuggestion[] = collections.map((col: any) => ({
            id: col.id,
            title: col.title,
            handle: col.handle,
            type: 'collection' as const,
        }))

        // Get popular searches (from cache)
        const popularSearches = await getPopularSearches(searchQuery)

        const response: SearchSuggestionsResponse = {
            products: productSuggestions,
            categories: categorySuggestions,
            collections: collectionSuggestions,
            popular: popularSearches,
        }

        // Cache the results
        await upstashRedis.set(cacheKey, response, CACHE_TTL)

        // Track this search for popularity metrics
        await trackSearch(searchQuery)

        res.json(response)
    } catch (error) {
        console.error("[Search] Error fetching suggestions:", error)
        res.status(500).json({
            error: "Failed to fetch search suggestions",
            products: [],
            categories: [],
            collections: [],
            popular: []
        })
    }
}

/**
 * Get popular search terms based on the current query prefix
 */
async function getPopularSearches(query: string): Promise<string[]> {
    try {
        const popularKey = `search:popular:all`
        const popular = await upstashRedis.get<Record<string, number>>(popularKey)

        if (!popular) return []

        // Filter searches that start with or contain the query
        const filtered = Object.entries(popular)
            .filter(([term]) => term.includes(query))
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([term]) => term)

        return filtered
    } catch (error) {
        console.error("[Search] Error getting popular searches:", error)
        return []
    }
}

/**
 * Track search term for popularity metrics
 */
async function trackSearch(query: string): Promise<void> {
    try {
        const popularKey = `search:popular:all`
        const termKey = `search:term:${query}`

        // Get current popular searches
        const popular = await upstashRedis.get<Record<string, number>>(popularKey) || {}

        // Increment counter for this term
        popular[query] = (popular[query] || 0) + 1

        // Keep only top 100 searches to prevent unbounded growth
        const sorted = Object.entries(popular)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 100)

        const trimmed = Object.fromEntries(sorted)

        // Update cache with 30-day expiration
        await upstashRedis.set(popularKey, trimmed, 60 * 60 * 24 * 30)

        // Also track individual term with timestamp
        await upstashRedis.set(termKey, {
            count: popular[query],
            lastSearched: new Date().toISOString()
        }, 60 * 60 * 24 * 7) // 7 days

    } catch (error) {
        console.error("[Search] Error tracking search:", error)
    }
}
