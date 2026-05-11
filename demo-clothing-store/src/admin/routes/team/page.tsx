import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Users, Plus, XMark } from "@medusajs/icons"
import { useState, useEffect, useCallback } from "react"
import { useUserRole } from "../../hooks/useUserRole"

// ─── Types ───────────────────────────────────────────────────────────────────
interface TeamUser {
    id: string
    email: string
    first_name?: string
    last_name?: string
    role: "admin" | "editor"
    created_at: string
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }: { role: "admin" | "editor" }) => (
    <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
            role === "admin" 
            ? "bg-ui-tag-violet-bg text-ui-tag-violet-text border-ui-tag-violet-border" 
            : "bg-ui-tag-green-bg text-ui-tag-green-text border-ui-tag-green-border"
        }`}
    >
        <span
            className={`w-1.5 h-1.5 rounded-full ${
                role === "admin" ? "bg-ui-tag-violet-icon" : "bg-ui-tag-green-icon"
            }`}
        />
        {role}
    </span>
)

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ email, name }: { email: string; name?: string }) => {
    const initials = name
        ? name.charAt(0).toUpperCase()
        : email.charAt(0).toUpperCase()
    const colors = [
        ["#ede9fe", "#7c3aed"],
        ["#fce7f3", "#be185d"],
        ["#dbeafe", "#1d4ed8"],
        ["#d1fae5", "#065f46"],
        ["#fef3c7", "#92400e"],
    ]
    const idx = email.charCodeAt(0) % colors.length
    const [bg, fg] = colors[idx]

    return (
        <div
            style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: bg,
                color: fg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 14,
                flexShrink: 0,
            }}
        >
            {initials}
        </div>
    )
}

// ─── Create User Modal ────────────────────────────────────────────────────────
const CreateUserModal = ({
    onClose,
    onCreated,
}: {
    onClose: () => void
    onCreated: () => void
}) => {
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
        role: "editor" as "admin" | "editor",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (form.password !== form.confirm_password) {
            setError("Passwords do not match.")
            return
        }
        if (form.password.length < 8) {
            setError("Password must be at least 8 characters.")
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/admin/team", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    role: form.role,
                    first_name: form.first_name,
                    last_name: form.last_name,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.message || "Failed to create user.")
                return
            }

            onCreated()
            onClose()
        } catch {
            setError("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="bg-ui-bg-base rounded-2xl p-8 w-full max-w-[480px] shadow-xl relative border border-ui-border-base"
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 24,
                    }}
                >
                    <div>
                        <h2 className="text-lg font-extrabold text-ui-fg-base m-0">
                            Add Team Member
                        </h2>
                        <p className="text-[12px] text-ui-fg-muted mt-1">
                            Create a new admin panel account
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 4,
                            color: "#999",
                            display: "flex",
                        }}
                    >
                        <XMark style={{ width: 20, height: 20 }} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Name row */}
                    <div
                        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
                    >
                        <div>
                            <label style={labelStyle}>First Name</label>
                            <input
                                style={inputStyle}
                                placeholder="John"
                                value={form.first_name}
                                onChange={(e) =>
                                    setForm({ ...form, first_name: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Last Name</label>
                            <input
                                style={inputStyle}
                                placeholder="Doe"
                                value={form.last_name}
                                onChange={(e) =>
                                    setForm({ ...form, last_name: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div style={{ marginTop: 14 }}>
                        <label style={labelStyle}>Email Address *</label>
                        <input
                            style={inputStyle}
                            type="email"
                            placeholder="john@alariya.com"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>

                    {/* Role */}
                    <div className="mt-4">
                        <label className="block text-[12px] font-semibold text-ui-fg-subtle mb-1.5">Role *</label>
                        <div className="flex gap-2.5 mt-1.5">
                            {(["admin", "editor"] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setForm({ ...form, role: r })}
                                    className={`flex-1 p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                                        form.role === r
                                            ? r === "admin"
                                                ? "border-ui-border-interactive bg-ui-bg-interactive-subtle"
                                                : "border-ui-tag-green-border bg-ui-tag-green-bg"
                                            : "border-ui-border-base bg-ui-bg-subtle"
                                    }`}
                                >
                                    <div
                                        className={`text-[13px] font-bold capitalize ${
                                            form.role === r
                                                ? r === "admin"
                                                    ? "text-ui-fg-interactive"
                                                    : "text-ui-tag-green-text"
                                                : "text-ui-fg-subtle"
                                        }`}
                                    >
                                        {r}
                                    </div>
                                    <div
                                        className={`text-[10px] mt-0.5 ${
                                            form.role === r
                                                ? r === "admin"
                                                    ? "text-ui-fg-interactive opacity-80"
                                                    : "text-ui-tag-green-text opacity-80"
                                                : "text-ui-fg-muted"
                                        }`}
                                    >
                                        {r === "admin" ? "Full access" : "No delete/invite"}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginTop: 14 }}>
                        <label style={labelStyle}>Password *</label>
                        <input
                            style={inputStyle}
                            type="password"
                            placeholder="Min. 8 characters"
                            required
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                    </div>

                    {/* Confirm Password */}
                    <div style={{ marginTop: 14 }}>
                        <label style={labelStyle}>Confirm Password *</label>
                        <input
                            style={inputStyle}
                            type="password"
                            placeholder="Repeat password"
                            required
                            value={form.confirm_password}
                            onChange={(e) =>
                                setForm({ ...form, confirm_password: e.target.value })
                            }
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mt-4 px-3.5 py-2.5 bg-ui-tag-red-bg border border-ui-tag-red-border rounded-lg text-ui-tag-red-text text-[12px]">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-5 w-full py-3 bg-ui-button-inverted text-ui-fg-on-inverted rounded-xl font-bold text-[14px] cursor-pointer transition-all hover:opacity-90 disabled:not-allowed disabled:opacity-50"
                    >
                        {loading ? "Creating account…" : "Create Account"}
                    </button>
                </form>
            </div>
        </div>
    )
}

// ─── Shared input / label styles ───────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--ui-fg-subtle)",
    marginBottom: 5,
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid var(--ui-border-base)",
    borderRadius: 8,
    fontSize: 13,
    color: "var(--ui-fg-base)",
    outline: "none",
    boxSizing: "border-box",
    background: "var(--ui-bg-base)",
    transition: "border-color 0.15s",
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const TeamManagementPage = () => {
    const [users, setUsers] = useState<TeamUser[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [updatingRole, setUpdatingRole] = useState<string | null>(null)
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

    const { role: myRole, loading: roleLoading } = useUserRole()

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch("/admin/team", { credentials: "include" })
            const data = await res.json()
            setUsers(data.users || [])
        } catch {
            showToast("Failed to load team members.", "error")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleRoleChange = async (userId: string, newRole: "admin" | "editor") => {
        setUpdatingRole(userId)
        try {
            const res = await fetch(`/admin/team/${userId}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            })
            if (!res.ok) {
                const d = await res.json()
                showToast(d.message || "Failed to update role.", "error")
                return
            }
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
            )
            showToast(`Role updated to ${newRole}`)
        } catch {
            showToast("Failed to update role.", "error")
        } finally {
            setUpdatingRole(null)
        }
    }

    if (!roleLoading && myRole !== "admin") {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <div className="w-14 h-14 rounded-2xl bg-ui-tag-red-bg flex items-center justify-center text-2xl">
                    🔒
                </div>
                <div className="text-[16px] font-bold text-ui-fg-base">
                    Access Restricted
                </div>
                <div className="text-[13px] text-ui-fg-muted">
                    Only admins can manage team members.
                </div>
            </div>
        )
    }

    return (
        <div
            style={{
                padding: "24px",
                fontFamily: "Inter, system-ui, sans-serif",
                maxWidth: 900,
            }}
        >
            {toast && (
                <div
                    className={`fixed bottom-6 right-6 px-4.5 py-3 rounded-xl border shadow-lg z-[999] flex items-center gap-2 text-[13px] font-semibold ${
                        toast.type === "success" 
                        ? "bg-ui-tag-green-bg border-ui-tag-green-border text-ui-tag-green-text" 
                        : "bg-ui-tag-red-bg border-ui-tag-red-border text-ui-tag-red-text"
                    }`}
                >
                    {toast.type === "success" ? "✅" : "❌"} {toast.msg}
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ui-tag-violet-bg flex items-center justify-center">
                        <Users className="text-ui-tag-violet-text w-4.5 h-4.5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-ui-fg-base m-0">
                            Team Management
                        </h1>
                        <p className="text-[12px] text-ui-fg-subtle mt-0.5">
                            {users.length} member{users.length !== 1 ? "s" : ""} · Manage access and roles
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-ui-button-inverted text-ui-fg-on-inverted rounded-xl font-bold text-[13px] cursor-pointer shadow-md transition-all hover:opacity-90 active:scale-95"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Member
                </button>
            </div>

            <div className="flex gap-4 mb-5 p-3.5 bg-ui-bg-subtle border border-ui-border-base rounded-xl">
                <div className="text-[12px] text-ui-fg-subtle flex items-center gap-2">
                    <RoleBadge role="admin" />
                    <span>Full access — can delete, invite &amp; manage roles</span>
                </div>
                <div className="text-[12px] text-ui-fg-subtle flex items-center gap-2">
                    <RoleBadge role="editor" />
                    <span>Read &amp; edit access — cannot delete or invite users</span>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col gap-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-[68px] rounded-xl bg-ui-bg-subtle animate-pulse"
                        />
                    ))}
                </div>
            ) : users.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "48px 0",
                        color: "#888",
                        fontSize: 14,
                    }}
                >
                    No team members yet.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {users.map((user) => {
                        const fullName = [user.first_name, user.last_name]
                            .filter(Boolean)
                            .join(" ")
                        const isUpdating = updatingRole === user.id

                        return (
                            <div
                                key={user.id}
                                className="flex items-center gap-3.5 px-[18px] py-[14px] bg-ui-bg-base border border-ui-border-base rounded-xl shadow-sm transition-shadow duration-150 hover:shadow-md"
                            >
                                <Avatar email={user.email} name={fullName || undefined} />

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="font-bold text-[13px] text-ui-fg-base truncate">
                                        {fullName || "—"}
                                    </div>
                                    <div className="text-[12px] text-ui-fg-muted truncate">
                                        {user.email}
                                    </div>
                                </div>

                                <div 
                                    className="text-[11px] text-ui-fg-muted whitespace-nowrap min-w-[80px] text-right"
                                >
                                    {new Date(user.created_at).toLocaleDateString()}
                                </div>

                                {/* Role Switcher */}
                                <div className="flex gap-1.5 ml-2">
                                    {(["admin", "editor"] as const).map((r) => (
                                        <button
                                            key={r}
                                            disabled={isUpdating}
                                            onClick={() =>
                                                user.role !== r && handleRoleChange(user.id, r)
                                            }
                                            className={`px-3 py-1 rounded-lg border-1.5 text-[11px] font-bold capitalize transition-all ${
                                                user.role === r
                                                    ? r === "admin"
                                                        ? "border-ui-border-interactive bg-ui-bg-interactive-subtle text-ui-fg-interactive"
                                                        : "border-ui-tag-green-border bg-ui-tag-green-bg text-ui-tag-green-text"
                                                    : "border-ui-border-base bg-transparent text-ui-fg-muted hover:bg-ui-bg-subtle"
                                            } ${isUpdating ? "opacity-50 cursor-default" : "cursor-pointer"}`}
                                        >
                                            {isUpdating && user.role !== r ? "…" : r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ── Create User Modal ── */}
            {showCreate && (
                <CreateUserModal
                    onClose={() => setShowCreate(false)}
                    onCreated={() => {
                        fetchUsers()
                        showToast("Team member created successfully!")
                    }}
                />
            )}
        </div>
    )
}

export const config = defineRouteConfig({
    label: "Team",
    icon: Users,
})

export default TeamManagementPage
