import type {
    MedusaRequest,
    MedusaResponse,
    MedusaNextFunction,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { ContainerRegistrationKeys, remoteQueryObjectFromString } from "@medusajs/framework/utils"

/**
 * Middleware: Block restricted actions for users with role "editor".
 *
 * Restricted actions:
 *   - Any DELETE request on /admin/* routes
 *   - POST /admin/invites  (invite new users)
 *   - POST /admin/team     (create new users)
 *   - PATCH /admin/team/*  (change roles)
 *
 * We check req.method and req.path internally instead of relying on
 * Medusa's `methods` filter in defineMiddlewares (which breaks when
 * the matcher is a RegExp, because Medusa converts it to a string
 * before passing to Express).
 *
 * Role is stored in user.metadata.role:
 *   - "admin"  → full access
 *   - "editor" → blocked for restricted actions
 *   - (unset)  → treated as admin (existing users)
 */
export async function blockIfEditor(
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
) {
    try {
        const method = req.method?.toUpperCase()
        const path = (req as any).path ?? req.url ?? ""

        // ── Determine if this request is a restricted action ────────────────────
        const isRestrictedDelete = method === "DELETE"
        const isRestrictedInvite = method === "POST" && /^\/invites(\/.*)?$/.test(path)
        const isRestrictedTeam = (method === "POST" || method === "PATCH") && /^\/team(\/.*)?$/.test(path)

        if (!isRestrictedDelete && !isRestrictedInvite && !isRestrictedTeam) {
            // Not a restricted action — pass through
            return next()
        }

        // ── Look up the logged-in user's role ────────────────────────────────────
        const userId = (req as any).auth_context?.actor_id

        if (!userId) {
            return next() // Not authenticated — let auth middleware handle this
        }

        const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY)

        const query = remoteQueryObjectFromString({
            entryPoint: "user",
            variables: { id: userId },
            fields: ["id", "metadata"],
        })

        const [user] = await remoteQuery(query)

        const role = user?.metadata?.role ?? "admin" // Existing users with no role → admin

        if (role === "editor") {
            return res.status(403).json({
                type: "not_allowed",
                message: "Editors are not allowed to perform this action.",
            })
        }

        return next()
    } catch (err) {
        // On unexpected errors, fail open (don't block if we can't check)
        console.error("[blockIfEditor] Error checking role:", err)
        return next()
    }
}
