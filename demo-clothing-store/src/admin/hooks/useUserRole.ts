import { useState, useEffect } from "react"

type UserRole = "admin" | "editor"

/**
 * Hook: useUserRole
 *
 * Fetches the current logged-in admin user's metadata and returns their role.
 * Role is stored in user.metadata.role as "admin" or "editor".
 *
 * Defaults to "editor" if no role is set (safer — read-only by default).
 *
 * Usage:
 *   const { role, loading } = useUserRole()
 *   const isAdmin = role === "admin"
 */
export function useUserRole(): { role: UserRole; loading: boolean } {
    const [role, setRole] = useState<UserRole>("admin")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const response = await fetch("/admin/users/me", {
                    credentials: "include",
                })

                if (!response.ok) {
                    setRole("admin") // Fail open — existing users default to admin
                    return
                }

                const data = await response.json()
                const userRole = data?.user?.metadata?.role

                // Only restrict if role is explicitly set to "editor"
                // Unset role (existing users) → treated as admin
                setRole(userRole === "editor" ? "editor" : "admin")
            } catch {
                setRole("admin") // Fail open — existing users default to admin
            } finally {
                setLoading(false)
            }
        }

        fetchRole()
    }, [])

    return { role, loading }
}
