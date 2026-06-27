import type {
    MedusaRequest,
    MedusaResponse,
    MedusaNextFunction,
} from "@medusajs/framework/http"
import {
    ContainerRegistrationKeys,
    remoteQueryObjectFromString,
} from "@medusajs/framework/utils"
import { DELETE_LOG_MODULE } from "../../modules/delete-log"

/**
 * Parse entity type and ID from an admin DELETE/PUT/PATCH URL.
 *
 * Examples:
 *   /products/prod_123           → { type: "product",    id: "prod_123" }
 *   /blog/post_123               → { type: "blog_post",  id: "post_123" }
 *   /hero-slides/slide_123       → { type: "hero_slide", id: "slide_123" }
 *   /reviews/rev_123             → { type: "review",     id: "rev_123" }
 *   /customers/cus_123           → { type: "customer",   id: "cus_123" }
 *   /products/prod_123/variants/var_123 → { type: "product_variant", id: "var_123" }
 */
function parseEntityFromPath(path: string): { type: string; id: string } | null {
    // Normalize: strip leading slash
    const p = path.replace(/^\//, "")
    const parts = p.split("/").filter(Boolean)

    if (parts.length < 2) return null

    const resourceMap: Record<string, string> = {
        products: "product",
        blog: "blog_post",
        "hero-slides": "hero_slide",
        reviews: "review",
        customers: "customer",
        orders: "order",
        collections: "collection",
        categories: "category",
        promotions: "promotion",
        "price-lists": "price_list",
        users: "user",
        regions: "region",
        "shipping-options": "shipping_option",
        "shipping-profiles": "shipping_profile",
        invites: "invite",
        "api-keys": "api_key",
        team: "team_user",
    }

    // Handle nested: e.g. products/prod_xxx/variants/var_xxx
    if (parts.length >= 4) {
        const subResource = parts[parts.length - 2]
        const subId = parts[parts.length - 1]
        const parentResource = parts[0]
        const subType = resourceMap[subResource]
        const parentType = resourceMap[parentResource]
        if (subType) return { type: subType, id: subId }
        if (parentType) return { type: `${parentType}_sub`, id: subId }
    }

    const resource = parts[0]
    const id = parts[1]
    const type = resourceMap[resource] ?? resource.replace(/-/g, "_")

    return { type, id }
}

/**
 * Detect entity ID, type, label, and action from response body JSON.
 */
function detectEntityFromResponse(body: any, path: string): { type: string; id: string; label: string | null; action?: string } | null {
    if (!body || typeof body !== "object") return null

    const p = path.replace(/^\//, "")
    const parts = p.split("/").filter(Boolean)

    // Check for Medusa batch/bulk response format (created, updated, deleted arrays)
    if (body && (Array.isArray(body.created) || Array.isArray(body.updated) || Array.isArray(body.deleted))) {
        const createdCount = Array.isArray(body.created) ? body.created.length : 0
        const updatedCount = Array.isArray(body.updated) ? body.updated.length : 0
        const deletedCount = Array.isArray(body.deleted) ? body.deleted.length : 0

        let entityType = "product"
        if (parts.includes("variants")) {
            entityType = "product_variant"
        } else if (parts.includes("products")) {
            entityType = "product"
        } else if (parts.includes("prices") || parts.includes("price-lists")) {
            entityType = "price_list"
        } else {
            const resourceMap: Record<string, string> = {
                products: "product",
                blog: "blog_post",
                customers: "customer",
                orders: "order",
                collections: "collection",
                categories: "category",
                promotions: "promotion",
            }
            entityType = resourceMap[parts[0]] ?? parts[0].replace(/-/g, "_")
        }

        const summaries: string[] = []
        if (createdCount > 0) summaries.push(`Added ${createdCount}`)
        if (updatedCount > 0) summaries.push(`Updated ${updatedCount}`)
        if (deletedCount > 0) summaries.push(`Deleted ${deletedCount}`)

        const typeLabel = entityType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        const label = `${summaries.join(", ")} ${typeLabel}${createdCount + updatedCount + deletedCount > 1 ? "s" : ""}`

        let finalAction = "update"
        if (createdCount > updatedCount && createdCount > deletedCount) {
            finalAction = "create"
        } else if (deletedCount > createdCount && deletedCount > updatedCount) {
            finalAction = "delete"
        }

        return {
            type: entityType,
            id: "batch",
            label,
            action: finalAction
        }
    }
    
    const resourceMap: Record<string, string> = {
        products: "product",
        blog: "blog_post",
        "hero-slides": "hero_slide",
        reviews: "review",
        customers: "customer",
        orders: "order",
        collections: "collection",
        categories: "category",
        promotions: "promotion",
        "price-lists": "price_list",
        users: "user",
        regions: "region",
        "shipping-options": "shipping_option",
        "shipping-profiles": "shipping_profile",
        invites: "invite",
        "api-keys": "api_key",
        team: "team_user",
    }
    
    // 1. Try to find a key matching the singular of the first resource part
    const possibleType = resourceMap[parts[0]]
    if (possibleType && body[possibleType] && typeof body[possibleType] === "object") {
        const entity = body[possibleType]
        if (entity.id) {
            let label: string | null = null
            if (entity.title) label = entity.title
            else if (entity.name) label = entity.name
            else if (entity.first_name || entity.last_name) {
                label = [entity.first_name, entity.last_name].filter(Boolean).join(" ")
            }
            else if (entity.email) label = entity.email
            else if (entity.code) label = entity.code
            else if (entity.display_id) label = `#${entity.display_id}`
            return { type: possibleType, id: entity.id, label }
        }
    }

    // 2. Fallback: search top-level keys for any object with an id
    for (const key of Object.keys(body)) {
        const val = body[key]
        if (val && typeof val === "object" && val.id) {
            let label: string | null = null
            if (val.title) label = val.title
            else if (val.name) label = val.name
            else if (val.first_name || val.last_name) {
                label = [val.first_name, val.last_name].filter(Boolean).join(" ")
            }
            else if (val.email) label = val.email
            else if (val.code) label = val.code
            else if (val.display_id) label = `#${val.display_id}`
            return { type: key, id: val.id, label }
        }
    }

    return null
}

/**
 * Recursive search to find product ID in payload/response object.
 */
function findProductId(obj: any): string | null {
    if (!obj || typeof obj !== "object") return null
    if (obj.product_id && typeof obj.product_id === "string") return obj.product_id
    if (obj.product && typeof obj.product === "object" && obj.product.id) return obj.product.id
    if (obj.id && typeof obj.id === "string" && obj.id.startsWith("prod_")) return obj.id
    
    for (const key of Object.keys(obj)) {
        try {
            if (typeof obj[key] === "object") {
                const found = findProductId(obj[key])
                if (found) return found
            }
        } catch {
            // Ignore
        }
    }
    return null
}

/**
 * Retrieve product ID from URL, request body, or response body context.
 */
function getProductIdFromContext(req: MedusaRequest, bodyObj: any): string | null {
    // 1. Check path for pattern prod_...
    const path = req.path ?? ""
    const match = path.match(/\b(prod_[A-Za-z0-9_]+)\b/)
    if (match) return match[1]

    // 2. Check request body
    if (req.body) {
        const reqProdId = findProductId(req.body)
        if (reqProdId) return reqProdId
    }

    // 3. Check response body
    if (bodyObj) {
        const resProdId = findProductId(bodyObj)
        if (resProdId) return resProdId
    }

    return null
}

/**
 * Fetch product title by ID.
 */
async function fetchProductTitle(remoteQuery: any, productId: string): Promise<string | null> {
    try {
        const query = remoteQueryObjectFromString({
            entryPoint: "product",
            variables: { id: productId },
            fields: ["title"],
        })
        const [product] = await remoteQuery(query)
        return product?.title ?? null
    } catch {
        return null
    }
}

/**
 * Try to fetch a human-readable label for the entity.
 */
async function fetchEntityLabel(
    remoteQuery: any,
    entityType: string,
    entityId: string
): Promise<string | null> {
    try {
        const entryPointMap: Record<string, { entry: string; fields: string[] }> = {
            product: { entry: "product", fields: ["id", "title"] },
            blog_post: { entry: "blog_post", fields: ["id", "title"] },
            hero_slide: { entry: "hero_slide", fields: ["id", "title"] },
            review: { entry: "review", fields: ["id", "title", "customer_name"] },
            customer: { entry: "customer", fields: ["id", "first_name", "last_name", "email"] },
            order: { entry: "order", fields: ["id", "display_id", "email"] },
            collection: { entry: "product_collection", fields: ["id", "title"] },
            user: { entry: "user", fields: ["id", "email", "first_name", "last_name"] },
        }

        const config = entryPointMap[entityType]
        if (!config) return null

        const query = remoteQueryObjectFromString({
            entryPoint: config.entry,
            variables: { id: entityId },
            fields: config.fields,
        })

        const [entity] = await remoteQuery(query)
        if (!entity) return null

        // Build a human label
        if (entity.title) return entity.title
        if (entity.email && entity.first_name) return `${entity.first_name} ${entity.last_name ?? ""} (${entity.email})`.trim()
        if (entity.email) return entity.email
        if (entity.display_id) return `#${entity.display_id}`
        return null
    } catch {
        return null
    }
}

/**
 * Custom formatter to generate human-readable detailed activity log labels.
 */
async function buildDetailedLabel(
    req: MedusaRequest,
    bodyObj: any,
    method: string,
    action: string,
    entityType: string,
    entityId: string,
    entityLabel: string | null,
    remoteQuery: any
): Promise<string> {
    const path = req.path ?? ""
    const actionVerb = action === "create" ? "Added" : action === "update" ? "Updated" : "Deleted"
    const displayType = entityType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

    const reqBody = (req.body ?? {}) as any
    const resBody = (bodyObj ?? {}) as any

    // 1. Orders
    if (path.includes("/orders")) {
        const orderDisplayId = entityLabel ? entityLabel : entityId
        
        if (path.endsWith("/custom-status")) {
            const status = reqBody.customStatus ?? resBody.order?.metadata?.custom_status ?? "unknown"
            return `Changed status of order ${orderDisplayId} to "${status}"`
        }
        if (path.endsWith("/mark-printed")) {
            return `Marked order ${orderDisplayId} as printed`
        }
        if (path.endsWith("/record-payment")) {
            const amount = reqBody.amount ?? 0
            return `Recorded manual payment of ${amount} for order ${orderDisplayId}`
        }
        if (path.endsWith("/fulfillments") || path.endsWith("/fulfillment")) {
            return `Fulfilled order ${orderDisplayId}`
        }
        if (path.endsWith("/cancel")) {
            return `Cancelled order ${orderDisplayId}`
        }
        if (path.endsWith("/capture")) {
            return `Captured payment for order ${orderDisplayId}`
        }
        if (path.endsWith("/refund")) {
            return `Refunded payment for order ${orderDisplayId}`
        }
        
        if (method === "DELETE") {
            return `Deleted order ${orderDisplayId}`
        }
        if (method === "POST" || method === "PUT" || method === "PATCH") {
            return `Updated details of order ${orderDisplayId}`
        }
    }

    // 2. Products & Variants
    if (path.includes("/products")) {
        let prodTitle = entityLabel
        
        // Resolve parent product name using our ID context check
        const productId = getProductIdFromContext(req, bodyObj)
        if (productId && !prodTitle) {
            prodTitle = await fetchProductTitle(remoteQuery, productId)
        }
        
        const displayProd = prodTitle ? `product "${prodTitle}"` : "product"

        if (path.includes("/variants/batch")) {
            const createdCount = Array.isArray(reqBody.create) ? reqBody.create.length : 0
            const updatedCount = Array.isArray(reqBody.update) ? reqBody.update.length : 0
            const deletedCount = Array.isArray(reqBody.delete) ? reqBody.delete.length : 0
            
            const summaries: string[] = []
            if (createdCount > 0) summaries.push(`added ${createdCount}`)
            if (updatedCount > 0) summaries.push(`updated ${updatedCount}`)
            if (deletedCount > 0) summaries.push(`deleted ${deletedCount}`)
            
            return `Bulk updated variants (${summaries.join(", ") || "modified"}) for ${displayProd}`
        }
        if (path.includes("/variants")) {
            const isUpdate = method === "PUT" || method === "PATCH" || path.split("/").length > 4
            const varTitle = resBody.variant?.title ?? reqBody.title ?? "variant"
            if (isUpdate) {
                return `Edited variant "${varTitle}" of ${displayProd}`
            } else {
                return `Added variant "${varTitle}" to ${displayProd}`
            }
        }
        
        if (method === "DELETE") {
            if (path.includes("/variants/")) {
                return `Deleted variant from ${displayProd}`
            }
            return `Deleted product "${prodTitle ?? entityId}"`
        }
        
        if (method === "POST" || method === "PUT" || method === "PATCH") {
            const isCreate = method === "POST" && !path.match(/\b(prod_[A-Za-z0-9_]+)\b/)
            if (isCreate) {
                const createdTitle = resBody.product?.title ?? reqBody.title ?? "new product"
                return `Created product "${createdTitle}"`
            } else {
                return `Edited details of ${displayProd}`
            }
        }
    }

    // 3. Prices & Price Lists
    if (path.includes("/price-lists")) {
        const title = resBody.price_list?.title ?? reqBody.title ?? entityLabel ?? "price list"
        if (method === "POST" && !path.match(/\b(pl_[A-Za-z0-9_]+)\b/)) {
            return `Created price list "${title}"`
        }
        if (method === "DELETE") {
            return `Deleted price list "${title}"`
        }
        return `Updated price list "${title}"`
    }

    // 4. Promotions
    if (path.includes("/promotions")) {
        const code = resBody.promotion?.code ?? reqBody.code ?? entityLabel ?? "promotion"
        if (method === "POST" && !path.match(/\b(promo_[A-Za-z0-9_]+)\b/)) {
            return `Created promotion code "${code}"`
        }
        if (method === "DELETE") {
            return `Deleted promotion code "${code}"`
        }
        return `Updated promotion code "${code}"`
    }

    // 5. Reviews
    if (path.includes("/reviews")) {
        let reviewTitle = entityLabel
        if (!reviewTitle && resBody.review) {
            reviewTitle = resBody.review.title ?? resBody.review.customer_name ?? null
        }
        const displayReview = reviewTitle ? `review "${reviewTitle}"` : "review"
        
        if (path.endsWith("/approve")) {
            return `Approved ${displayReview}`
        }
        if (path.endsWith("/reject")) {
            return `Rejected ${displayReview}`
        }
        if (method === "DELETE") {
            return `Deleted ${displayReview}`
        }
        return `Updated ${displayReview}`
    }

    // 6. Inventory / Stock
    if (path.includes("/inventory-items") || path.includes("/stock-locations")) {
        return `Updated inventory stock levels`
    }

    // 7. Bulk Products custom table
    if (path.includes("/bulk-products")) {
        if (method === "POST") {
            return `Added product to bulk listings`
        }
        if (method === "DELETE") {
            return `Removed product from bulk listings`
        }
    }

    // 8. Hero Slides
    if (path.includes("/hero-slides")) {
        const label = entityLabel ?? resBody.hero_slide?.title ?? reqBody.title ?? "hero slide"
        if (method === "POST" && !path.match(/\b(slide_[A-Za-z0-9_]+)\b/)) {
            return `Created hero slide "${label}"`
        }
        if (method === "DELETE") {
            return `Deleted hero slide "${label}"`
        }
        return `Updated hero slide "${label}"`
    }

    // 9. Blog
    if (path.includes("/blog")) {
        const label = entityLabel ?? resBody.blog_post?.title ?? reqBody.title ?? "blog post"
        if (method === "POST" && !path.match(/\b(post_[A-Za-z0-9_]+)\b/)) {
            return `Created blog post "${label}"`
        }
        if (method === "DELETE") {
            return `Deleted blog post "${label}"`
        }
        return `Updated blog post "${label}"`
    }

    // 10. Team & Users
    if (path.includes("/team") || path.includes("/users")) {
        const userEmail = entityLabel ?? resBody.user?.email ?? reqBody.email ?? "team member"
        if (method === "POST") {
            return `Invited / added team member "${userEmail}"`
        }
        if (method === "DELETE") {
            return `Removed team member "${userEmail}"`
        }
        return `Updated team member profile "${userEmail}"`
    }

    // Generic fallback
    return `${actionVerb} ${displayType} "${entityLabel ?? entityId}"`
}

/**
 * Middleware: Audit log for POST, PUT, PATCH, and DELETE requests.
 */
export async function auditActionLog(
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
) {
    const method = req.method?.toUpperCase() || ""
    const isWriteAction = ["POST", "PUT", "PATCH", "DELETE"].includes(method)

    if (!isWriteAction) {
        return next()
    }

    const path = (req as any).path ?? ""

    try {
        const authContext = (req as any).auth_context
        const actorId: string | undefined = authContext?.actor_id

        let actorEmail: string | null = null
        let actorName: string | null = null
        let entityLabel: string | null = null
        let parsed = parseEntityFromPath(path)

        // For DELETE requests, try to fetch the label BEFORE it gets deleted
        if (method === "DELETE" && actorId) {
            try {
                const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY)

                // Fetch actor info
                const userQuery = remoteQueryObjectFromString({
                    entryPoint: "user",
                    variables: { id: actorId },
                    fields: ["id", "email", "first_name", "last_name"],
                })
                const [actor] = await remoteQuery(userQuery)
                if (actor) {
                    actorEmail = actor.email ?? null
                    actorName = [actor.first_name, actor.last_name].filter(Boolean).join(" ") || null
                }

                if (parsed) {
                    entityLabel = await fetchEntityLabel(remoteQuery, parsed.type, parsed.id)
                }
            } catch {
                // Non-critical — continue
            }
        }

        // Intercept response to capture response body (for JSON responses) and write the audit log
        const originalWrite = res.write.bind(res)
        const originalEnd = res.end.bind(res)
        const chunks: Buffer[] = []

        res.write = function (chunk: any, ...args: any[]) {
            const contentType = res.getHeader("content-type") as string || ""
            if (contentType.includes("application/json") && chunk) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
            }
            return originalWrite(chunk, ...args)
        }

        res.end = function (chunk: any, ...args: any[]) {
            const contentType = res.getHeader("content-type") as string || ""
            if (contentType.includes("application/json") && chunk) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
            }

            // Call the original end response synchronously and return
            const result = originalEnd(chunk, ...args)

            // Audit only successful writes (2xx status) in the background
            const statusCode = res.statusCode
            if (statusCode >= 200 && statusCode < 300) {
                (async () => {
                    try {
                        let detected: { type: string; id: string; label: string | null; action?: string } | null = null
                        let bodyObj: any = null

                        if (chunks.length > 0) {
                            try {
                                const bodyStr = Buffer.concat(chunks).toString("utf8")
                                bodyObj = JSON.parse(bodyStr)
                                detected = detectEntityFromResponse(bodyObj, path)
                            } catch {
                                // Non-critical parse failure
                            }
                        }

                        // Map HTTP method and URL structure to audit actions
                        let action = "delete"
                        if (detected?.action) {
                            action = detected.action
                        } else if (method === "POST") {
                            if (parsed && parsed.id && parsed.id !== "batch") {
                                action = "update"
                            } else {
                                action = "create"
                            }
                        } else if (method === "PUT" || method === "PATCH") {
                            action = "update"
                        }

                        // Normalize sub-entity names (e.g. product_sub -> product)
                        let entityType = detected?.type ?? parsed?.type ?? "unknown"
                        if (entityType.endsWith("_sub")) {
                            entityType = entityType.replace("_sub", "")
                        }

                        const entityId = detected?.id ?? parsed?.id ?? path
                        let finalLabel = detected?.label ?? entityLabel

                        // For bulk/batch requests, build a user-friendly label description
                        if (entityId === "batch" && !finalLabel) {
                            const displayType = entityType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                            finalLabel = `Bulk action on ${displayType}s`
                        }

                        // Resolve actor information
                        if (actorId) {
                            try {
                                const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY)
                                
                                // Fetch user/actor email and name
                                if (!actorEmail) {
                                    const userQuery = remoteQueryObjectFromString({
                                        entryPoint: "user",
                                        variables: { id: actorId },
                                        fields: ["id", "email", "first_name", "last_name"],
                                    })
                                    const [actor] = await remoteQuery(userQuery)
                                    if (actor) {
                                        actorEmail = actor.email ?? null
                                        actorName = [actor.first_name, actor.last_name].filter(Boolean).join(" ") || null
                                    }
                                }

                                // Fetch resource label if not set
                                if (!finalLabel && entityType !== "unknown" && entityId && !entityId.includes("/") && entityId !== "batch") {
                                    finalLabel = await fetchEntityLabel(remoteQuery, entityType, entityId)
                                }
                            } catch {
                                // Ignore
                            }
                        }

                        // Build the highly descriptive human-readable audit label
                        const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY)
                        const detailedLabel = await buildDetailedLabel(
                            req,
                            bodyObj,
                            method,
                            action,
                            entityType,
                            entityId,
                            finalLabel,
                            remoteQuery
                        )

                        const deleteLogService = req.scope.resolve(DELETE_LOG_MODULE) as any
                        await deleteLogService.createDeleteLogs([{
                            action,
                            entity_type: entityType,
                            entity_id: entityId,
                            entity_label: detailedLabel,
                            actor_id: actorId ?? "unknown",
                            actor_email: actorEmail,
                            actor_name: actorName,
                            url: req.originalUrl ?? req.url,
                            metadata: {
                                status_code: statusCode,
                                user_agent: req.headers?.["user-agent"] ?? null,
                                method,
                            },
                        }])
                    } catch (logErr) {
                        console.error("[auditActionLog] Failed to write audit log:", logErr)
                    }
                })()
            }

            return result
        }

        return next()
    } catch (err) {
        console.error("[auditActionLog] Middleware error:", err)
        return next()
    }
}

// Export the original name as an alias for compatibility
export const auditDeleteLog = auditActionLog;
