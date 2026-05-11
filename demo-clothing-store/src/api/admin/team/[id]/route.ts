import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, MedusaError } from "@medusajs/framework/utils"

// ─── PATCH /admin/team/[id]/role — update a user's role ─────────────────────
export const PATCH = async (req: MedusaRequest, res: MedusaResponse) => {
    const { id } = req.params
    const { role } = req.body as any

    if (!role || !["admin", "editor"].includes(role)) {
        throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            "Role must be either 'admin' or 'editor'."
        )
    }

    const userService = req.scope.resolve(Modules.USER)

    const [user] = await userService.updateUsers([
        {
            id,
            metadata: { role },
        },
    ])

    if (!user) {
        throw new MedusaError(
            MedusaError.Types.NOT_FOUND,
            `User with id ${id} not found.`
        )
    }

    return res.json({ user: { ...user, role } })
}
