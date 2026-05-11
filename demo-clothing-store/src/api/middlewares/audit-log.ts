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
 * Parse entity type and ID from an admin DELETE URL.
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
 * Try to fetch a human-readable label for the entity before it's deleted.
 * Best effort — falls back to the ID if we can't fetch it.
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
 * Middleware: Audit log for DELETE requests.
 *
 * On every DELETE /admin/* request:
 * 1. Wraps res.end to intercept the response
 * 2. If the response is 2xx (success), writes a DeleteLog entry
 * 3. Captures: who deleted it, what was deleted, when
 */
export async function auditDeleteLog(
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
) {
    // Only audit DELETE requests
    if (req.method?.toUpperCase() !== "DELETE") {
        return next()
    }

    const path = (req as any).path ?? ""

    try {
        const authContext = (req as any).auth_context
        const actorId: string | undefined = authContext?.actor_id

        // Parse what's being deleted
        const parsed = parseEntityFromPath(path)

        // Fetch actor info and entity label (best effort, before deletion)
        let actorEmail: string | null = null
        let actorName: string | null = null
        let entityLabel: string | null = null

        if (actorId) {
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

                // Fetch entity label (before it gets deleted)
                if (parsed) {
                    entityLabel = await fetchEntityLabel(remoteQuery, parsed.type, parsed.id)
                }
            } catch {
                // Non-critical — continue
            }
        }

        // Intercept the response to check if deletion succeeded
        const originalEnd = res.end.bind(res)

            ; (res as any).end = async function (chunk: any, ...args: any[]) {
                // Restore original immediately
                ; (res as any).end = originalEnd

                // Call original response
                originalEnd(chunk, ...args)

                // Only log successful deletions (2xx status)
                const statusCode = res.statusCode
                if (statusCode >= 200 && statusCode < 300) {
                    try {
                        const deleteLogService = req.scope.resolve(DELETE_LOG_MODULE) as any

                        await deleteLogService.createDeleteLogs([{
                            entity_type: parsed?.type ?? "unknown",
                            entity_id: parsed?.id ?? path,
                            entity_label: entityLabel,
                            actor_id: actorId ?? "unknown",
                            actor_email: actorEmail,
                            actor_name: actorName,
                            url: req.originalUrl ?? req.url,
                            metadata: {
                                status_code: statusCode,
                                user_agent: req.headers?.["user-agent"] ?? null,
                            },
                        }])
                    } catch (logErr) {
                        console.error("[auditDeleteLog] Failed to write delete log:", logErr)
                    }
                }
            }

        return next()
    } catch (err) {
        console.error("[auditDeleteLog] Middleware error:", err)
        return next()
    }
}
