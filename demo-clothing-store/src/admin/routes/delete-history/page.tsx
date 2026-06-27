import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
    ArchiveBox,
    ShoppingBag,
    PencilSquare,
    Camera,
    Star,
    User,
    ShoppingCart,
    BookOpen,
    Tag,
    ReceiptPercent,
    Cash,
    Buildings,
    ShieldCheck,
    Users,
    Trash,
} from "@medusajs/icons"
import { useState, useEffect, useCallback, ComponentType } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────
interface DeleteLog {
    id: string
    action?: string
    entity_type: string
    entity_id: string
    entity_label: string | null
    actor_id: string
    actor_email: string | null
    actor_name: string | null
    url: string
    metadata: Record<string, any> | null
    created_at: string
}

// ─── Entity type colour + icon map ────────────────────────────────────────────
interface EntityMeta {
    label: string
    color: string
    bg: string
    Icon: ComponentType<any>
}

const ENTITY_META: Record<string, EntityMeta> = {
    product: { label: "Product", color: "#6366f1", bg: "#eef2ff", Icon: ShoppingBag },
    product_variant: { label: "Variant", color: "#8b5cf6", bg: "#f5f3ff", Icon: ShoppingBag },
    product_sub: { label: "Product Sub", color: "#8b5cf6", bg: "#f5f3ff", Icon: ShoppingBag },
    blog_post: { label: "Blog Post", color: "#0ea5e9", bg: "#e0f2fe", Icon: PencilSquare },
    hero_slide: { label: "Hero Slide", color: "#f59e0b", bg: "#fef3c7", Icon: Camera },
    review: { label: "Review", color: "#ec4899", bg: "#fdf2f8", Icon: Star },
    customer: { label: "Customer", color: "#14b8a6", bg: "#ccfbf1", Icon: User },
    order: { label: "Order", color: "#22c55e", bg: "#dcfce7", Icon: ShoppingCart },
    collection: { label: "Collection", color: "#f97316", bg: "#fff7ed", Icon: BookOpen },
    category: { label: "Category", color: "#84cc16", bg: "#f7fee7", Icon: Tag },
    promotion: { label: "Promotion", color: "#ef4444", bg: "#fef2f2", Icon: ReceiptPercent },
    price_list: { label: "Price List", color: "#3b82f6", bg: "#eff6ff", Icon: Cash },
    user: { label: "User", color: "#a855f7", bg: "#faf5ff", Icon: Users },
    team_user: { label: "Team User", color: "#a855f7", bg: "#faf5ff", Icon: Users },
    region: { label: "Region", color: "#06b6d4", bg: "#ecfeff", Icon: Buildings },
    api_key: { label: "API Key", color: "#64748b", bg: "#f1f5f9", Icon: ShieldCheck },
}

// ─── Action Metadata ───────────────────────────────────────────────────────────
interface ActionMeta {
    label: string
    color: string
    bg: string
}

const ACTION_META: Record<string, ActionMeta> = {
    create: { label: "Add", color: "#10b981", bg: "#ecfdf5" },
    update: { label: "Edit", color: "#3b82f6", bg: "#eff6ff" },
    delete: { label: "Delete", color: "#ef4444", bg: "#fef2f2" },
}

function getEntityMeta(type: string): EntityMeta {
    return ENTITY_META[type] ?? {
        label: type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        color: "var(--ui-fg-muted)",
        bg: "var(--ui-bg-subtle)",
        Icon: Trash,
    }
}

// ─── Time formatter ────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return "just now"
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    return `${d}d ago`
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

// ─── Type Badge ───────────────────────────────────────────────────────────────
const TypeBadge = ({ type }: { type: string }) => {
    const m = getEntityMeta(type)
    const { Icon } = m
    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
            style={{
                background: m.bg,
                color: m.color,
            }}
        >
            <Icon className="w-2.5 h-2.5" />
            {m.label}
        </span>
    )
}

// ─── Action Badge ───────────────────────────────────────────────────────────────
const ActionBadge = ({ action }: { action?: string }) => {
    const act = action ?? "delete"
    const meta = ACTION_META[act] ?? ACTION_META.delete
    return (
        <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
            style={{
                background: meta.bg,
                color: meta.color,
            }}
        >
            {meta.label}
        </span>
    )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const DeleteHistoryPage = () => {
    const [logs, setLogs] = useState<DeleteLog[]>([])
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [filter, setFilter] = useState("all")
    const [actionFilter, setActionFilter] = useState("all")
    const [search, setSearch] = useState("")
    const limit = 30

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                limit: String(limit),
                offset: String(page * limit),
            })
            if (filter !== "all") params.set("entity_type", filter)
            if (actionFilter !== "all") params.set("action", actionFilter)

            const res = await fetch(`/admin/delete-history?${params}`, { credentials: "include" })
            const data = await res.json()
            setLogs(data.logs ?? [])
            setCount(data.count ?? 0)
        } catch (e) {
            console.error("Failed to load audit history:", e)
        } finally {
            setLoading(false)
        }
    }, [page, filter, actionFilter])

    useEffect(() => { fetchLogs() }, [fetchLogs])
    useEffect(() => { setPage(0) }, [filter, actionFilter])

    // Client-side search
    const visible = search.trim()
        ? logs.filter((l) =>
            l.entity_label?.toLowerCase().includes(search.toLowerCase()) ||
            l.entity_id.toLowerCase().includes(search.toLowerCase()) ||
            l.actor_email?.toLowerCase().includes(search.toLowerCase()) ||
            l.actor_name?.toLowerCase().includes(search.toLowerCase()) ||
            l.entity_type.toLowerCase().includes(search.toLowerCase())
        )
        : logs

    const totalPages = Math.ceil(count / limit)

    return (
        <div style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif", maxWidth: 1000 }}>

            {/* ── Header ── */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-ui-tag-blue-bg flex items-center justify-center">
                    <ShieldCheck className="text-ui-tag-blue-text w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-xl font-extrabold text-ui-fg-base m-0">
                        Audit Logs
                    </h1>
                    <p className="text-[12px] text-ui-fg-subtle m-0.5 mt-0">
                        Audit trail of all administrative actions · {count} total
                    </p>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="flex gap-2.5 mb-4 flex-wrap">
                <input
                    type="text"
                    placeholder="Search by name, email, ID…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-2 border border-ui-border-base rounded-lg text-[12px] text-ui-fg-base outline-none w-[220px] bg-ui-bg-base"
                />

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 border border-ui-border-base rounded-lg text-[12px] text-ui-fg-base outline-none bg-ui-bg-base cursor-pointer"
                >
                    <option value="all">All Types</option>
                    {Object.entries(ENTITY_META).map(([key, m]) => (
                        <option key={key} value={key}>{m.label}</option>
                    ))}
                </select>

                <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="px-3 py-2 border border-ui-border-base rounded-lg text-[12px] text-ui-fg-base outline-none bg-ui-bg-base cursor-pointer"
                >
                    <option value="all">All Actions</option>
                    <option value="create">Add / Create</option>
                    <option value="update">Edit / Update</option>
                    <option value="delete">Delete</option>
                </select>

                <button
                    onClick={fetchLogs}
                    disabled={loading}
                    className="px-3.5 py-2 bg-ui-bg-base border border-ui-border-base rounded-lg text-[12px] font-semibold text-ui-fg-base cursor-pointer disabled:not-allowed disabled:opacity-60"
                >
                    {loading ? "Loading…" : "↻ Refresh"}
                </button>
            </div>

            {/* ── Log List ── */}
            {loading && logs.length === 0 ? (
                <div className="flex flex-col gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-[72px] rounded-xl bg-ui-bg-subtle animate-pulse" />
                    ))}
                </div>
            ) : visible.length === 0 ? (
                <div className="text-center py-[60px] text-ui-fg-muted text-[14px]">
                    <div className="flex justify-center mb-3">
                        <ShieldCheck className="w-10 h-10 text-ui-border-strong" />
                    </div>
                    {search ? "No results match your search." : "No actions recorded yet."}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {visible.map((log) => {
                        const m = getEntityMeta(log.entity_type)
                        const act = log.action ?? "delete"
                        const actMeta = ACTION_META[act] ?? ACTION_META.delete
                        const { Icon } = m
                        return (
                            <div
                                key={log.id}
                                className="flex items-center gap-3.5 px-[18px] py-[14px] bg-ui-bg-base border border-ui-border-base rounded-xl shadow-sm transition-shadow duration-150 hover:shadow-md"
                                style={{
                                    borderLeft: `4px solid ${actMeta.color}`,
                                }}
                            >
                                {/* Icon */}
                                <div 
                                    className="w-[38px] h-[38px] rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: m.bg }}
                                >
                                    <Icon className="w-[18px] h-[18px]" style={{ color: m.color }} />
                                </div>

                                {/* Main info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-[3px]">
                                        <ActionBadge action={log.action} />
                                        <TypeBadge type={log.entity_type} />
                                        <span className="font-bold text-[13px] text-ui-fg-base">
                                            {log.entity_label ?? log.entity_id}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-ui-fg-muted flex gap-2.5 flex-wrap">
                                        <span title={log.entity_id}>
                                            ID:{" "}
                                            <code className="font-mono text-[10px] text-ui-fg-subtle">
                                                {log.entity_id.length > 28 ? `${log.entity_id.slice(0, 28)}…` : log.entity_id}
                                            </code>
                                        </span>
                                    </div>
                                </div>

                                {/* Actor */}
                                <div className="text-right shrink-0">
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <User className="w-3 h-3 text-ui-fg-muted" />
                                        <span className="text-[12px] font-semibold text-ui-fg-subtle">
                                            {log.actor_name ?? log.actor_email ?? log.actor_id}
                                        </span>
                                    </div>
                                    {log.actor_email && log.actor_name && (
                                        <div className="text-[11px] text-ui-fg-muted mt-0.5">
                                            {log.actor_email}
                                        </div>
                                    )}
                                </div>

                                {/* Timestamp */}
                                <div 
                                    className="text-right shrink-0 min-w-[80px]"
                                    title={formatDate(log.created_at)}
                                >
                                    <div className="text-[12px] font-semibold text-ui-fg-subtle">
                                        {timeAgo(log.created_at)}
                                    </div>
                                    <div className="text-[10px] text-ui-fg-muted mt-0.5">
                                        {formatDate(log.created_at)}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-5">
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-4 py-[7px] rounded-lg border border-ui-border-base bg-ui-bg-base text-[12px] font-semibold text-ui-fg-base cursor-pointer disabled:not-allowed disabled:bg-ui-bg-subtle disabled:text-ui-fg-muted"
                    >
                        ← Previous
                    </button>
                    <span className="text-[12px] text-ui-fg-muted">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-4 py-[7px] rounded-lg border border-ui-border-base bg-ui-bg-base text-[12px] font-semibold text-ui-fg-base cursor-pointer disabled:not-allowed disabled:bg-ui-bg-subtle disabled:text-ui-fg-muted"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    )
}

export const config = defineRouteConfig({
    label: "Audit Logs",
    icon: ShieldCheck,
})

export default DeleteHistoryPage
