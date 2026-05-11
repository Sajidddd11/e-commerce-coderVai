import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
    ContainerRegistrationKeys,
    Modules,
    MedusaError,
    remoteQueryObjectFromString,
} from "@medusajs/framework/utils"
import { createUserAccountWorkflow } from "@medusajs/core-flows"

// ─── GET /admin/team — list all users with their roles ───────────────────────
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const remoteQuery = req.scope.resolve(
        ContainerRegistrationKeys.REMOTE_QUERY
    )

    const query = remoteQueryObjectFromString({
        entryPoint: "user",
        fields: ["id", "email", "first_name", "last_name", "metadata", "created_at"],
    })

    const users = await remoteQuery(query)

    const usersWithRole = users.map((u: any) => ({
        ...u,
        role: u.metadata?.role ?? "editor",
    }))

    return res.json({ users: usersWithRole })
}

// ─── POST /admin/team — create a new user with role ──────────────────────────
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const { email, password, role = "editor", first_name = "", last_name = "" } =
        req.body as any

    if (!email || !password) {
        throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            "Email and password are required."
        )
    }

    const authService = req.scope.resolve(Modules.AUTH)

    // Step 1: Register auth identity (emailpass provider handles hashing)
    const { success, error, authIdentity } = await authService.register(
        "emailpass",
        {
            url: req.url,
            headers: req.headers as Record<string, string>,
            query: req.query as Record<string, string>,
            body: { email, password },
            protocol: req.protocol,
        }
    )

    if (!success || !authIdentity) {
        throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            error || "Failed to create auth identity. Email may already be in use."
        )
    }

    // Step 2: Create user and link auth identity via core workflow
    const { result: user } = await createUserAccountWorkflow(req.scope).run({
        input: {
            authIdentityId: authIdentity.id,
            userData: {
                email,
                first_name,
                last_name,
                metadata: { role },
            },
        },
    })

    return res.status(201).json({ user: { ...user, role } })
}
