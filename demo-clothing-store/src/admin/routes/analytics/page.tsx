import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
    ChartBar,
    CurrencyDollar,
    Calendar,
    ShoppingCart,
    Users,
    LockClosedSolid,
    ArchiveBox,
    Receipt,
    User,
    ShoppingBag,
    Star,
    PencilSquare,
    Tag,
    ArrowLongUp,
    ArrowLongDown,
    ExclamationCircle,
    BuildingStorefront,
    XCircle,
    ArrowPath,
    ChartPie,
} from "@medusajs/icons"
import { useState, useEffect } from "react"

// ─────────────────────────── Types ────────────────────────────────────────────
interface StatsData {
    currency: string
    revenue: {
        total: number
        today: number
        this_week: number
        this_month: number
        prev_month: number
    }
    orders: {
        total: number
        today: number
        this_week: number
        this_month: number
        status_breakdown: Record<string, number>
        payment_status_breakdown: Record<string, number>
    }
    customers: { total: number; new_this_month: number }
    admins: { total: number }
    avg_order_value: number
    revenue_trend: { date: string; revenue: number; orders: number }[]
    cancellation_rate: number
    repeat_customer_rate: number
    unfulfilled_orders: { count: number; oldest_hours: number }
    payment_method_split: { method: string; count: number; revenue: number }[]
    top_products: {
        title: string
        quantity: number
        revenue: number
        order_count: number
    }[]
    revenue_by_dow: { day: string; revenue: number; orders: number }[]
}

interface CustomPeriodResult {
    start_date: string
    end_date: string
    currency: string
    revenue: number
    total_orders: number
    revenue_orders: number
    cancelled_orders: number
    avg_order_value: number
    daily_breakdown: { date: string; revenue: number; orders: number }[]
}

// ─────────────────────────── Preset config ────────────────────────────────────
const PRESETS = [
    { key: "today", label: "Today" },
    { key: "7d", label: "Last 7d" },
    { key: "30d", label: "Last 30d" },
    { key: "this_month", label: "This Month" },
    { key: "last_month", label: "Last Month" },
    { key: "all", label: "All Time" },
    { key: "custom", label: "Custom" },
] as const
type Preset = (typeof PRESETS)[number]["key"]

const getPresetRange = (preset: Preset): { start: string; end: string } => {
    const now = new Date()
    const todayStr = now.toISOString().split("T")[0]
    switch (preset) {
        case "today":
            return { start: todayStr, end: todayStr }
        case "7d": {
            const d = new Date()
            d.setDate(d.getDate() - 6)
            return { start: d.toISOString().split("T")[0], end: todayStr }
        }
        case "30d": {
            const d = new Date()
            d.setDate(d.getDate() - 29)
            return { start: d.toISOString().split("T")[0], end: todayStr }
        }
        case "this_month": {
            const s = new Date(now.getFullYear(), now.getMonth(), 1)
            return { start: s.toISOString().split("T")[0], end: todayStr }
        }
        case "last_month": {
            const s = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            const e = new Date(now.getFullYear(), now.getMonth(), 0)
            return {
                start: s.toISOString().split("T")[0],
                end: e.toISOString().split("T")[0],
            }
        }
        default:
            return { start: "", end: "" }
    }
}

// ─────────────────────────── Helpers ──────────────────────────────────────────
const fmt = (amount: number, currency = "BDT") => {
    if (!amount && amount !== 0) return "—"
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(amount)
}
const num = (n: number) => new Intl.NumberFormat("en-US").format(n)
const pct = (a: number, b: number): number | null => {
    if (!b) return null
    return ((a - b) / b) * 100
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sk = ({ h = 20, w = "100%" }: { h?: number; w?: string | number }) => (
    <div
        style={{ height: h, width: w, borderRadius: 6 }}
        className="bg-ui-bg-subtle animate-pulse"
    />
)

// ─── Trend Badge ─────────────────────────────────────────────────────────────
const TrendBadge = ({ value }: { value: number | null }) => {
    if (value === null) return null
    const up = value >= 0
    return (
        <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                up
                    ? "bg-ui-tag-green-bg text-ui-tag-green-text"
                    : "bg-ui-tag-red-bg text-ui-tag-red-text"
            }`}
        >
            {up ? (
                <ArrowLongUp className="w-2.5 h-2.5" />
            ) : (
                <ArrowLongDown className="w-2.5 h-2.5" />
            )}
            {Math.abs(value).toFixed(1)}%
        </span>
    )
}

// ─── Pill Button ──────────────────────────────────────────────────────────────
const Pill = ({
    label,
    active,
    onClick,
    color,
}: {
    label: string
    active: boolean
    onClick: () => void
    color?: string
}) => {
    const ac = color ?? "#6366f1"
    return (
        <button
            onClick={onClick}
            style={{
                padding: "3px 10px",
                borderRadius: 20,
                border: `1px solid ${active ? ac : "#e5e7eb"}`,
                background: active ? ac : "#fff",
                color: active ? "#fff" : "#6b7280",
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap" as const,
                lineHeight: 1.4,
            }}
        >
            {label}
        </button>
    )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({
    label,
    value,
    sub,
    trend,
    icon,
    accent,
    iconBg,
    loading = false,
    alert = false,
}: {
    label: string
    value: string
    sub?: string
    trend?: number | null
    icon: React.ReactNode
    accent: string
    iconBg: string
    loading?: boolean
    alert?: boolean
}) => (
    <div
        className={`relative rounded-xl p-5 border shadow-sm flex flex-col gap-2.5 overflow-hidden ${
            alert
                ? "bg-ui-tag-orange-bg border-ui-tag-orange-border"
                : "bg-ui-bg-base border-ui-border-base"
        }`}
    >
        <div
            className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
            style={{ background: accent }}
        />
        <div className="flex items-center justify-between">
            <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: iconBg }}
            >
                <span style={{ color: accent }} className="flex">
                    {icon}
                </span>
            </div>
            {trend !== undefined && <TrendBadge value={trend ?? null} />}
        </div>
        <div>
            {loading ? (
                <div className="flex flex-col gap-1.5">
                    <Sk h={24} w="60%" />
                    <Sk h={12} w="45%" />
                </div>
            ) : (
                <>
                    <div className="text-[22px] font-bold text-ui-fg-base leading-[1.15]">
                        {value}
                    </div>
                    <div className="text-[11px] text-ui-fg-subtle mt-0.5 font-medium">
                        {label}
                    </div>
                    {sub && (
                        <div className="text-[10px] text-ui-fg-muted mt-0.5">{sub}</div>
                    )}
                </>
            )}
        </div>
    </div>
)

// ─── Section Card ─────────────────────────────────────────────────────────────
const Card = ({
    title,
    sub,
    children,
    className = "",
    filterSlot,
}: {
    title: string
    sub?: string
    children: React.ReactNode
    className?: string
    filterSlot?: React.ReactNode
}) => (
    <div
        className={`bg-ui-bg-base rounded-xl p-5 border border-ui-border-base shadow-sm ${className}`}
    >
        <div className="flex items-start justify-between gap-3 mb-3.5">
            <div className="min-w-0">
                <div className="text-[13px] font-bold text-ui-fg-base">{title}</div>
                {sub && (
                    <div className="text-[11px] text-ui-fg-muted mt-0.5">{sub}</div>
                )}
            </div>
            {filterSlot && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                        flexShrink: 0,
                        maxWidth: "55%",
                    }}
                >
                    {filterSlot}
                </div>
            )}
        </div>
        {children}
    </div>
)

// ─── Progress Bar Row ─────────────────────────────────────────────────────────
const ProgRow = ({
    label,
    count,
    total,
    color,
    extra,
}: {
    label: string
    count: number
    total: number
    color: string
    extra?: string
}) => {
    const w = total > 0 ? (count / total) * 100 : 0
    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: color }}
                    />
                    <span className="text-xs text-ui-fg-subtle capitalize">{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-ui-fg-base">{num(count)}</span>
                    {extra && (
                        <span className="text-[10px] text-ui-fg-muted">{extra}</span>
                    )}
                    <span className="text-[10px] text-ui-fg-muted min-w-[30px] text-right">
                        {w.toFixed(0)}%
                    </span>
                </div>
            </div>
            <div className="h-1 rounded-full bg-ui-bg-subtle overflow-hidden">
                <div
                    className="h-full rounded-full transition-[width] duration-1000"
                    style={{ width: `${w}%`, background: color }}
                />
            </div>
        </div>
    )
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
const BarChart = ({
    data,
    currency,
    highlightLast = false,
}: {
    data: { date?: string; day?: string; revenue: number; orders: number }[]
    currency: string
    highlightLast?: boolean
}) => {
    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
    const maxIdx = data.reduce(
        (best, d, i) => (d.revenue > data[best].revenue ? i : best),
        0
    )
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
        <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 80 }}>
            {data.map((d, i) => {
                const h = Math.max((d.revenue / maxRevenue) * 100, 2)
                const isHighlight = highlightLast ? i === data.length - 1 : i === maxIdx

                let label = ""
                if (d.day) {
                    label = d.day.slice(0, 3)
                } else if (d.date) {
                    const dt = new Date(d.date + "T00:00:00")
                    label = data.length <= 14 ? days[dt.getDay()] : `${dt.getDate()}`
                }

                return (
                    <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1"
                        title={`${d.day ?? d.date}\n${fmt(d.revenue, currency)}\n${d.orders} orders`}
                    >
                        <div
                            className={`w-full rounded-t-sm min-h-[3px] transition-[height] duration-700 ${
                                isHighlight ? "bg-ui-button-inverted" : "bg-ui-bg-subtle"
                            }`}
                            style={{ height: `${h}%` }}
                        />
                        <span
                            className={`text-[9px] ${
                                isHighlight
                                    ? "text-ui-fg-base font-bold"
                                    : "text-ui-fg-muted"
                            }`}
                        >
                            {label}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

// ─── Status/Payment meta ──────────────────────────────────────────────────────
const ORDER_STATUS: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "#f59e0b" },
    processing: { label: "Processing", color: "#a855f7" },
    shipped: { label: "Shipped", color: "#3b82f6" },
    delivered: { label: "Delivered", color: "#22c55e" },
    completed: { label: "Completed", color: "#16a34a" },
    canceled: { label: "Cancelled", color: "#ef4444" },
    refunded: { label: "Refunded", color: "#f97316" },
}

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
    captured: { label: "Captured (Paid)", color: "#22c55e" },
    completed: { label: "Completed", color: "#16a34a" },
    awaiting: { label: "Awaiting", color: "#f59e0b" },
    authorized: { label: "Authorized", color: "#3b82f6" },
    not_paid: { label: "Not Paid", color: "#d1d5db" },
    canceled: { label: "Cancelled", color: "#ef4444" },
}

const PM_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6"]

const QUICK_LINKS = [
    { label: "Orders Manager", icon: Receipt, href: "/app/orders-with-address" },
    { label: "Customers", icon: User, href: "/app/customers" },
    { label: "Products", icon: ShoppingBag, href: "/app/products" },
    { label: "Reviews", icon: Star, href: "/app/reviews" },
    { label: "Blog Posts", icon: PencilSquare, href: "/app/blog" },
    { label: "Promotions", icon: Tag, href: "/app/promotions" },
    { label: "Store Overview", icon: BuildingStorefront, href: "/app" },
]

// ─── Link Card ────────────────────────────────────────────────────────────────
const QuickLink = ({
    label,
    icon: Icon,
    href,
}: {
    label: string
    icon: any
    href: string
}) => (
    <a
        href={href}
        className="flex items-center gap-2 px-3.5 py-2 bg-ui-bg-subtle border border-ui-border-base rounded-lg no-underline text-ui-fg-base text-[12px] font-semibold transition-all hover:bg-ui-bg-base hover:border-ui-border-strong hover:text-ui-fg-interactive hover:shadow-md hover:-translate-y-px"
    >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {label}
    </a>
)

// ─────────────────────────── Main Page ────────────────────────────────────────
const AnalyticsDashboardPage = () => {
    const [stats, setStats] = useState<StatsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

    // ── Global date filter ──────────────────────────────────────────────────
    const today = new Date().toISOString().split("T")[0]
    const [activePreset, setActivePreset] = useState<Preset>("all")
    const [filterStart, setFilterStart] = useState("")
    const [filterEnd, setFilterEnd] = useState("")
    const [showCustom, setShowCustom] = useState(false)
    const [customTempStart, setCustomTempStart] = useState(() => {
        const d = new Date()
        d.setDate(d.getDate() - 29)
        return d.toISOString().split("T")[0]
    })
    const [customTempEnd, setCustomTempEnd] = useState(today)

    // ── Per-segment filters ─────────────────────────────────────────────────
    const [trendDays, setTrendDays] = useState<7 | 14 | 30>(7)
    const [productLimit, setProductLimit] = useState<5 | 10 | 20>(5)
    const [pmSort, setPmSort] = useState<"count" | "revenue">("count")
    const [dowMode, setDowMode] = useState<"total" | "avg">("total")
    const [hiddenStatuses, setHiddenStatuses] = useState<Set<string>>(new Set())
    const [hiddenPayStatuses, setHiddenPayStatuses] = useState<Set<string>>(new Set())

    // ── Custom period (standalone calculator) ───────────────────────────────
    const firstOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    )
        .toISOString()
        .split("T")[0]
    const [customStart, setCustomStart] = useState(firstOfMonth)
    const [customEnd, setCustomEnd] = useState(today)
    const [customResult, setCustomResult] = useState<CustomPeriodResult | null>(null)
    const [customLoading, setCustomLoading] = useState(false)
    const [customError, setCustomError] = useState<string | null>(null)

    // ── Fetch main stats ────────────────────────────────────────────────────
    const [financeStats, setFinanceStats] = useState<{ revenue: number; cogs: number; expenses: number; profit: number } | null>(null)

    const fetchStats = async (startDate = "", endDate = "") => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams()
            if (startDate) params.set("start_date", startDate)
            if (endDate) params.set("end_date", endDate)
            params.set("trend_days", "30")
            params.set("top_limit", "20")
            const qs = params.toString()

            const [res, financeRes] = await Promise.all([
                fetch(`/admin/stats${qs ? `?${qs}` : ""}`, {
                    credentials: "include",
                }),
                fetch(`/admin/finance/stats?${params.toString()}`, {
                    credentials: "include",
                })
            ])

            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            setStats(await res.json())

            if (financeRes.ok) {
                const fData = await financeRes.json()
                setFinanceStats(fData.stats)
            }
            setLastRefreshed(new Date())
        } catch (e: any) {
            setError(e?.message ?? "Failed to load analytics")
        } finally {
            setLoading(false)
        }
    }

    // ── Preset apply ────────────────────────────────────────────────────────
    const applyPreset = (preset: Preset) => {
        setActivePreset(preset)
        if (preset === "custom") {
            setShowCustom(true)
            return
        }
        setShowCustom(false)
        const { start, end } = getPresetRange(preset)
        setFilterStart(start)
        setFilterEnd(end)
        fetchStats(start, end)
    }

    const applyCustomFilter = () => {
        setFilterStart(customTempStart)
        setFilterEnd(customTempEnd)
        fetchStats(customTempStart, customTempEnd)
        setShowCustom(false)
    }

    // ── Custom period calculator ────────────────────────────────────────────
    const fetchCustomPeriod = async () => {
        if (!customStart || !customEnd) return
        setCustomLoading(true)
        setCustomError(null)
        setCustomResult(null)
        try {
            const res = await fetch(
                `/admin/stats/custom-period?start_date=${customStart}&end_date=${customEnd}`,
                { credentials: "include" }
            )
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message || `HTTP ${res.status}`)
            }
            setCustomResult(await res.json())
        } catch (e: any) {
            setCustomError(e?.message ?? "Failed to calculate period revenue")
        } finally {
            setCustomLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    // ── Derived / computed data ─────────────────────────────────────────────
    const currency = stats?.currency || "BDT"
    const revenueTrend = stats
        ? pct(stats.revenue.this_month, stats.revenue.prev_month)
        : null
    const ordersTotal = stats?.orders.total || 0
    const statusBreakdown = stats?.orders.status_breakdown || {}
    const paymentBreakdown = stats?.orders.payment_status_breakdown || {}

    // Revenue trend sliced to trendDays
    const trendData = stats?.revenue_trend?.slice(-trendDays) ?? []

    // Top products sliced to productLimit
    const topProductsData = stats?.top_products?.slice(0, productLimit) ?? []

    // Payment method split sorted
    const paymentMethodData = stats?.payment_method_split
        ? [...stats.payment_method_split].sort((a, b) =>
              pmSort === "revenue" ? b.revenue - a.revenue : b.count - a.count
          )
        : []

    // DoW: rotate Mon first, apply avg mode
    const rawDow = stats?.revenue_by_dow
        ? [...stats.revenue_by_dow.slice(1), stats.revenue_by_dow[0]]
        : []
    const dowChartData = rawDow.map((d) =>
        dowMode === "avg"
            ? { ...d, revenue: d.orders > 0 ? Math.round(d.revenue / d.orders) : 0 }
            : d
    )

    // Status toggle helpers
    const toggleStatus = (key: string) => {
        setHiddenStatuses((prev) => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }
    const togglePayStatus = (key: string) => {
        setHiddenPayStatuses((prev) => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    const handleExportPDF = () => {
        // 1. Top products breakdown rows
        const topProductsRows = (stats?.top_products || []).slice(0, 8).map((p, idx) => `
            <tr>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">${idx + 1}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #111827;">${p.title}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #1f2937;">${p.quantity}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #10b981;">${fmt(p.revenue, currency)}</td>
            </tr>
        `).join("")

        // 2. Sales by payment gateway rows
        const paymentRows = (stats?.payment_method_split || []).map(item => `
            <tr>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #111827;">${item.method || "Direct / Invoice"}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #1f2937;">${num(item.count)}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #10b981;">${fmt(item.revenue, currency)}</td>
            </tr>
        `).join("")

        // 3. Order status summary rows
        const orderStatusMap = stats?.orders.status_breakdown || {}
        const statusRows = Object.entries(orderStatusMap).map(([status, count]) => `
            <tr>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500; text-transform: capitalize; color: #111827;">${status}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #1f2937;">${num(count)}</td>
            </tr>
        `).join("")

        // 4. Payment status summary rows
        const paymentStatusMap = stats?.orders.payment_status_breakdown || {}
        const payStatusRows = Object.entries(paymentStatusMap).map(([status, count]) => `
            <tr>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500; text-transform: capitalize; color: #111827;">${status}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #1f2937;">${num(count)}</td>
            </tr>
        `).join("")

        // 5. Day of Week Sales rows
        const dowRows = (stats?.revenue_by_dow || []).map(item => `
            <tr>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #111827;">${item.day}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #1f2937;">${num(item.orders)}</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #10b981;">${fmt(item.revenue, currency)}</td>
            </tr>
        `).join("")

        const printWindow = window.open("", "_blank")
        if (!printWindow) return

        const html = `
            <html>
            <head>
                <title>Zahan Business Performance Report</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1f2937; line-height: 1.5; background: #fff; }
                    .header-container { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 24px; }
                    .logo { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; color: #111827; }
                    .report-title { font-size: 14px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; }
                    
                    .section-header { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #9ca3af; letter-spacing: 0.05em; margin-bottom: 14px; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; }
                    
                    .meta-grid-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 30px; font-size: 12px; }
                    .meta-item { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 12px 14px; }
                    .meta-label { font-size: 10px; text-transform: uppercase; color: #9ca3af; font-weight: 600; margin-bottom: 4px; }
                    .meta-value { font-size: 13px; font-weight: 700; color: #111827; }
                    
                    .section-title { font-size: 14px; font-weight: 700; color: #111827; margin-top: 30px; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; }
                    @media print {
                        body { padding: 20px; }
                    }
                </style>
            </head>
            <body>
                <div class="header-container">
                    <div class="logo">ZAHAN</div>
                    <div class="report-title">Sales & Performance Report</div>
                </div>

                <div class="section-header">1. Executive Overview Metrics</div>
                <div class="meta-grid-kpis">
                    <div class="meta-item">
                        <div class="meta-label">Selected Period</div>
                        <div class="meta-value">${activeFilterLabel}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Avg. Order Value</div>
                        <div class="meta-value">${fmt(stats?.avg_order_value ?? 0, currency)}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Repeat Customer Rate</div>
                        <div class="meta-value">${stats?.repeat_customer_rate?.toFixed(1) ?? "0.0"}%</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Cancellation Rate</div>
                        <div class="meta-value">${stats?.cancellation_rate?.toFixed(1) ?? "0.0"}%</div>
                    </div>
                    
                    <div class="meta-item">
                        <div class="meta-label">Total Orders</div>
                        <div class="meta-value">${num(stats?.orders.total ?? 0)}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Total Customers</div>
                        <div class="meta-value">${num(stats?.customers.total ?? 0)}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Unfulfilled Orders</div>
                        <div class="meta-value">${num(stats?.unfulfilled_orders.count ?? 0)}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Admin Accounts</div>
                        <div class="meta-value">${num(stats?.admins.total ?? 0)}</div>
                    </div>
                </div>

                <div class="section-header" style="margin-top: 30px;">2. Financial Breakdown (Period Match)</div>
                <div class="meta-grid-kpis" style="margin-bottom: 35px;">
                    <div class="meta-item" style="border-left: 3px solid #6366f1;">
                        <div class="meta-label">Total Revenue</div>
                        <div class="meta-value" style="color: #6366f1;">${fmt(financeStats?.revenue ?? 0, currency)}</div>
                    </div>
                    <div class="meta-item" style="border-left: 3px solid #ef4444;">
                        <div class="meta-label">Cost of Goods (COGS)</div>
                        <div class="meta-value" style="color: #ef4444;">${fmt(financeStats?.cogs ?? 0, currency)}</div>
                    </div>
                    <div class="meta-item" style="border-left: 3px solid #f59e0b;">
                        <div class="meta-label">Operational Expenses</div>
                        <div class="meta-value" style="color: #f59e0b;">${fmt(financeStats?.expenses ?? 0, currency)}</div>
                    </div>
                    <div class="meta-item" style="border-left: 3px solid #10b981;">
                        <div class="meta-label">Net Profit Margin</div>
                        <div class="meta-value" style="color: #10b981;">${fmt(financeStats?.profit ?? 0, currency)}</div>
                    </div>
                </div>

                <div class="section-header" style="margin-top: 30px;">3. Performance Details & Breakdowns</div>
                <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 30px;">
                    <div>
                        <div class="section-title">Top Performing Products</div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="padding: 8px 12px; text-align: left; color: #4b5563; border-bottom: 2px solid #e5e7eb;">#</th>
                                    <th style="padding: 8px 12px; text-align: left; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Product</th>
                                    <th style="padding: 8px 12px; text-align: center; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Units</th>
                                    <th style="padding: 8px 12px; text-align: right; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${topProductsRows}
                            </tbody>
                        </table>

                        <div class="section-title" style="margin-top: 30px;">Sales by Day of Week</div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="padding: 8px 12px; text-align: left; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Day</th>
                                    <th style="padding: 8px 12px; text-align: center; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Orders</th>
                                    <th style="padding: 8px 12px; text-align: right; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${dowRows}
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <div class="section-title">Sales by Payment Method</div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="padding: 8px 12px; text-align: left; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Gateway</th>
                                    <th style="padding: 8px 12px; text-align: center; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Orders</th>
                                    <th style="padding: 8px 12px; text-align: right; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${paymentRows}
                            </tbody>
                        </table>

                        <div class="section-title" style="margin-top: 30px;">Order Status Distribution</div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="padding: 8px 12px; text-align: left; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Status</th>
                                    <th style="padding: 8px 12px; text-align: right; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${statusRows}
                            </tbody>
                        </table>

                        <div class="section-title" style="margin-top: 30px;">Payment Status Distribution</div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="padding: 8px 12px; text-align: left; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Payment Status</th>
                                    <th style="padding: 8px 12px; text-align: right; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${payStatusRows}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style="margin-top: 60px; border-top: 1px solid #e5e7eb; padding-top: 12px; font-size: 11px; color: #9ca3af; text-align: center;">
                    Generated by Zahan Administration on ${new Date().toLocaleString()} &bull; Page 1 of 1
                </div>
            </body>
            </html>
        `
        printWindow.document.write(html)
        printWindow.document.close()

        printWindow.focus()
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 500)
    }

    // Active filter label for header
    const activeFilterLabel =
        activePreset === "custom" && filterStart && filterEnd
            ? `${filterStart} to ${filterEnd}`
            : PRESETS.find((p) => p.key === activePreset)?.label ?? "All Time"

    return (
        <div style={{ padding: "24px", fontFamily: "Inter, system-ui, sans-serif" }}>

            {/* ── Header ── */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-ui-bg-subtle flex items-center justify-center">
                        <ChartBar className="text-ui-fg-interactive w-4 h-4" />
                    </div>
                    <div>
                        <h1 className="text-lg font-extrabold text-ui-fg-base m-0">
                            Company Analytics
                        </h1>
                        <p className="text-ui-fg-muted text-[11px] m-0 mt-0.5">
                            Refreshed: {lastRefreshed.toLocaleTimeString()} &middot; Showing:{" "}
                            <span className="font-semibold text-ui-fg-base">
                                {activeFilterLabel}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-ui-border-base bg-ui-bg-base text-ui-fg-base text-[12px] font-semibold cursor-pointer"
                    >
                        Export Report (PDF)
                    </button>
                    <button
                        onClick={() => fetchStats(filterStart, filterEnd)}
                        disabled={loading}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-ui-border-base bg-ui-bg-base text-ui-fg-base text-[12px] font-semibold cursor-pointer disabled:opacity-70"
                    >
                        <ArrowPath className="w-3.5 h-3.5" />
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            {/* ── Global Filter Bar ── */}
            <div
                style={{
                    background: "#fafafa",
                    border: "1px solid #efefef",
                    borderRadius: 12,
                    padding: "12px 16px",
                    marginBottom: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#999",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Date Range
                    </span>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {PRESETS.map((p) => (
                            <Pill
                                key={p.key}
                                label={p.label}
                                active={activePreset === p.key}
                                onClick={() => applyPreset(p.key)}
                            />
                        ))}
                    </div>
                </div>

                {showCustom && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-end",
                            gap: 8,
                            flexWrap: "wrap",
                            paddingTop: 8,
                            borderTop: "1px dashed #e5e7eb",
                        }}
                    >
                        {(["FROM", "TO"] as const).map((lbl, idx) => (
                            <div
                                key={lbl}
                                style={{ display: "flex", flexDirection: "column", gap: 3 }}
                            >
                                <label style={{ fontSize: 10, color: "#888", fontWeight: 700 }}>
                                    {lbl}
                                </label>
                                <input
                                    type="date"
                                    value={idx === 0 ? customTempStart : customTempEnd}
                                    max={today}
                                    onChange={(e) =>
                                        idx === 0
                                            ? setCustomTempStart(e.target.value)
                                            : setCustomTempEnd(e.target.value)
                                    }
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: 8,
                                        border: "1px solid #e5e7eb",
                                        fontSize: 12,
                                        color: "#374151",
                                        background: "#fff",
                                        outline: "none",
                                    }}
                                />
                            </div>
                        ))}
                        <button
                            onClick={applyCustomFilter}
                            disabled={!customTempStart || !customTempEnd}
                            style={{
                                padding: "6px 18px",
                                borderRadius: 8,
                                border: "none",
                                background: "#6366f1",
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Apply
                        </button>
                        <button
                            onClick={() => {
                                setShowCustom(false)
                                setActivePreset("all")
                                setFilterStart("")
                                setFilterEnd("")
                                fetchStats()
                            }}
                            style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                border: "1px solid #e5e7eb",
                                background: "#fff",
                                color: "#888",
                                fontSize: 12,
                                cursor: "pointer",
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {activePreset !== "all" && !showCustom && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                background: "#eef2ff",
                                border: "1px solid #c7d2fe",
                                borderRadius: 20,
                                padding: "2px 10px 2px 8px",
                                fontSize: 11,
                                color: "#6366f1",
                                fontWeight: 600,
                            }}
                        >
                            {activeFilterLabel}
                            <button
                                onClick={() => applyPreset("all")}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#6366f1",
                                    padding: 0,
                                    lineHeight: 1,
                                    fontSize: 16,
                                    fontWeight: 700,
                                }}
                                title="Clear filter"
                            >
                                x
                            </button>
                        </span>
                        <span style={{ fontSize: 10, color: "#bbb" }}>
                            Click x to reset to All Time
                        </span>
                    </div>
                )}
            </div>

            {/* ── Error banner ── */}
            {error && (
                <div className="flex items-center gap-2 bg-ui-tag-red-bg border border-ui-tag-red-border rounded-lg px-3.5 py-2.5 mb-4 text-ui-tag-red-text text-[12px]">
                    <ExclamationCircle className="w-3.5 h-3.5 shrink-0" />
                    {error}
                </div>
            )}

            {/* ── Unfulfilled Orders Alert ── */}
            {!loading && stats && stats.unfulfilled_orders.count > 0 && (
                <div className="flex items-center gap-2.5 bg-ui-tag-orange-bg border border-ui-tag-orange-border rounded-lg px-4 py-2.5 mb-4">
                    <ExclamationCircle className="w-4 h-4 text-ui-tag-orange-text shrink-0" />
                    <div className="flex-1">
                        <span className="text-[13px] font-bold text-ui-tag-orange-text">
                            {stats.unfulfilled_orders.count} order
                            {stats.unfulfilled_orders.count !== 1 ? "s" : ""} stuck in Pending for more than 24 hours
                        </span>
                        <span className="text-[12px] text-ui-tag-orange-text opacity-80 ml-1.5">
                            (oldest: {stats.unfulfilled_orders.oldest_hours}h ago)
                        </span>
                    </div>
                    <a
                        href="/app/orders-with-address"
                        className="text-[12px] font-semibold text-ui-tag-orange-text no-underline whitespace-nowrap hover:underline"
                    >
                        View Orders
                    </a>
                </div>
            )}

            {/* ── Row 1: KPI Cards ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
                    gap: 14,
                    marginBottom: 16,
                }}
            >
                <KpiCard
                    loading={loading}
                    icon={<CurrencyDollar style={{ width: 16, height: 16 }} />}
                    label="Total Revenue (All Time)"
                    value={fmt(stats?.revenue.total ?? 0, currency)}
                    sub={`Today: ${fmt(stats?.revenue.today ?? 0, currency)}`}
                    accent="#6366f1"
                    iconBg="#eef2ff"
                />
                <KpiCard
                    loading={loading}
                    icon={<Calendar style={{ width: 16, height: 16 }} />}
                    label="Revenue This Month"
                    value={fmt(stats?.revenue.this_month ?? 0, currency)}
                    sub={`Last month: ${fmt(stats?.revenue.prev_month ?? 0, currency)}`}
                    trend={revenueTrend}
                    accent="#8b5cf6"
                    iconBg="#f5f3ff"
                />
                <KpiCard
                    loading={loading}
                    icon={<CurrencyDollar style={{ width: 16, height: 16 }} />}
                    label="Net Profit (Selected Range)"
                    value={fmt(financeStats?.profit ?? 0, currency)}
                    sub={`COGS: ${fmt(financeStats?.cogs ?? 0, currency)} | Expenses: ${fmt(financeStats?.expenses ?? 0, currency)}`}
                    accent="#10b981"
                    iconBg="#ecfdf5"
                />
                <KpiCard
                    loading={loading}
                    icon={<ShoppingCart style={{ width: 16, height: 16 }} />}
                    label="Total Orders"
                    value={num(stats?.orders.total ?? 0)}
                    sub={`Today: ${num(stats?.orders.today ?? 0)} / Month: ${num(stats?.orders.this_month ?? 0)}`}
                    accent="#3b82f6"
                    iconBg="#eff6ff"
                />
                <KpiCard
                    loading={loading}
                    icon={<Users style={{ width: 16, height: 16 }} />}
                    label="Total Customers"
                    value={num(stats?.customers.total ?? 0)}
                    sub={`New this month: ${num(stats?.customers.new_this_month ?? 0)}`}
                    accent="#22c55e"
                    iconBg="#f0fdf4"
                />
                <KpiCard
                    loading={loading}
                    icon={<LockClosedSolid style={{ width: 16, height: 16 }} />}
                    label="Admin Users"
                    value={num(stats?.admins.total ?? 0)}
                    sub="Active admin accounts"
                    accent="#f59e0b"
                    iconBg="#fffbeb"
                />
                <KpiCard
                    loading={loading}
                    icon={<ArchiveBox style={{ width: 16, height: 16 }} />}
                    label="Avg. Order Value"
                    value={fmt(stats?.avg_order_value ?? 0, currency)}
                    sub="Revenue orders only"
                    accent="#ec4899"
                    iconBg="#fdf2f8"
                />
                <KpiCard
                    loading={loading}
                    icon={<XCircle style={{ width: 16, height: 16 }} />}
                    label="Cancellation Rate"
                    value={`${stats?.cancellation_rate?.toFixed(1) ?? "0.0"}%`}
                    sub={`${num(statusBreakdown["canceled"] || 0)} cancelled orders`}
                    accent={(stats?.cancellation_rate ?? 0) > 15 ? "#ef4444" : "#f97316"}
                    iconBg={(stats?.cancellation_rate ?? 0) > 15 ? "#fef2f2" : "#fff7ed"}
                    alert={(stats?.cancellation_rate ?? 0) > 15}
                />
                <KpiCard
                    loading={loading}
                    icon={<ArrowPath style={{ width: 16, height: 16 }} />}
                    label="Repeat Customer Rate"
                    value={`${stats?.repeat_customer_rate?.toFixed(1) ?? "0.0"}%`}
                    sub="Customers with 2+ orders"
                    accent="#14b8a6"
                    iconBg="#f0fdfa"
                />
            </div>

            {/* ── Row 2: Revenue Trend + Order Status + Payment Status ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.3fr 1fr 1fr",
                    gap: 14,
                    marginBottom: 16,
                }}
            >
                {/* Revenue Trend */}
                <Card
                    title="Revenue Trend"
                    sub="Cancelled/refunded excluded - hover bars for details"
                    filterSlot={
                        <>
                            {([7, 14, 30] as const).map((d) => (
                                <Pill
                                    key={d}
                                    label={`${d}d`}
                                    active={trendDays === d}
                                    onClick={() => setTrendDays(d)}
                                />
                            ))}
                        </>
                    }
                >
                    {loading ? (
                        <div
                            style={{
                                display: "flex",
                                gap: 5,
                                alignItems: "flex-end",
                                height: 80,
                            }}
                        >
                            {[40, 55, 30, 70, 45, 80, 60].map((h, i) => (
                                <div
                                    key={i}
                                    style={{
                                        flex: 1,
                                        background: "#f3f4f6",
                                        borderRadius: "3px 3px 0 0",
                                        height: `${h}%`,
                                    }}
                                />
                            ))}
                        </div>
                    ) : trendData.length > 0 ? (
                        <>
                            <BarChart data={trendData} currency={currency} highlightLast />
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginTop: 10,
                                    borderTop: "1px solid #f3f4f6",
                                    paddingTop: 10,
                                }}
                            >
                                {[
                                    {
                                        label: "Period Revenue",
                                        val: fmt(
                                            trendData.reduce((s, d) => s + d.revenue, 0),
                                            currency
                                        ),
                                    },
                                    {
                                        label: "Orders",
                                        val: num(trendData.reduce((s, d) => s + d.orders, 0)),
                                    },
                                    {
                                        label: "AOV",
                                        val: (() => {
                                            const totalOrds = trendData.reduce(
                                                (s, d) => s + d.orders,
                                                0
                                            )
                                            const totalRev = trendData.reduce(
                                                (s, d) => s + d.revenue,
                                                0
                                            )
                                            return totalOrds > 0
                                                ? fmt(totalRev / totalOrds, currency)
                                                : "—"
                                        })(),
                                    },
                                ].map((item) => (
                                    <div key={item.label} style={{ textAlign: "center" }}>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: "#111",
                                            }}
                                        >
                                            {item.val}
                                        </div>
                                        <div style={{ fontSize: 10, color: "#aaa" }}>
                                            {item.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ color: "#aaa", fontSize: 12 }}>No data</div>
                    )}
                </Card>

                {/* Order Status */}
                <Card
                    title="Order Status"
                    sub="Click pills to show or hide statuses"
                    filterSlot={
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 4,
                                justifyContent: "flex-end",
                            }}
                        >
                            {Object.entries(ORDER_STATUS).map(([key, meta]) => {
                                const count = statusBreakdown[key] || 0
                                if (count === 0 && key !== "pending") return null
                                return (
                                    <button
                                        key={key}
                                        onClick={() => toggleStatus(key)}
                                        title={`${hiddenStatuses.has(key) ? "Show" : "Hide"} ${meta.label}`}
                                        style={{
                                            padding: "2px 7px",
                                            borderRadius: 20,
                                            border: `1px solid ${meta.color}`,
                                            background: hiddenStatuses.has(key)
                                                ? "#fff"
                                                : meta.color,
                                            color: hiddenStatuses.has(key)
                                                ? meta.color
                                                : "#fff",
                                            fontSize: 10,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            opacity: hiddenStatuses.has(key) ? 0.55 : 1,
                                            transition: "all 0.15s",
                                        }}
                                    >
                                        {meta.label}
                                    </button>
                                )
                            })}
                        </div>
                    }
                >
                    {loading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Sk key={i} h={26} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {Object.entries(ORDER_STATUS).map(([key, meta]) => {
                                const count = statusBreakdown[key] || 0
                                if (hiddenStatuses.has(key)) return null
                                if (count === 0 && key !== "pending") return null
                                return (
                                    <ProgRow
                                        key={key}
                                        label={meta.label}
                                        count={count}
                                        total={ordersTotal}
                                        color={meta.color}
                                    />
                                )
                            })}
                            {Object.keys(ORDER_STATUS).every((k) =>
                                hiddenStatuses.has(k)
                            ) && (
                                <div
                                    style={{
                                        color: "#aaa",
                                        fontSize: 12,
                                        textAlign: "center",
                                        padding: "16px 0",
                                    }}
                                >
                                    All statuses hidden. Click a pill to show.
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                {/* Payment Status */}
                <Card
                    title="Payment Status"
                    sub="Click pills to show or hide payment statuses"
                    filterSlot={
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 4,
                                justifyContent: "flex-end",
                            }}
                        >
                            {Object.entries(PAYMENT_STATUS).map(([key, meta]) => {
                                const count = paymentBreakdown[key] || 0
                                if (count === 0) return null
                                return (
                                    <button
                                        key={key}
                                        onClick={() => togglePayStatus(key)}
                                        title={`${hiddenPayStatuses.has(key) ? "Show" : "Hide"} ${meta.label}`}
                                        style={{
                                            padding: "2px 7px",
                                            borderRadius: 20,
                                            border: `1px solid ${meta.color}`,
                                            background: hiddenPayStatuses.has(key)
                                                ? "#fff"
                                                : meta.color,
                                            color: hiddenPayStatuses.has(key)
                                                ? meta.color
                                                : "#fff",
                                            fontSize: 10,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            opacity: hiddenPayStatuses.has(key) ? 0.55 : 1,
                                            transition: "all 0.15s",
                                        }}
                                    >
                                        {meta.label.split(" ")[0]}
                                    </button>
                                )
                            })}
                        </div>
                    }
                >
                    {loading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Sk key={i} h={26} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {Object.entries(PAYMENT_STATUS).map(([key, meta]) => {
                                const count = paymentBreakdown[key] || 0
                                if (hiddenPayStatuses.has(key)) return null
                                if (count === 0) return null
                                return (
                                    <ProgRow
                                        key={key}
                                        label={meta.label}
                                        count={count}
                                        total={ordersTotal}
                                        color={meta.color}
                                    />
                                )
                            })}
                            {Object.values(paymentBreakdown).every((v) => v === 0) && (
                                <div
                                    style={{
                                        color: "#aaa",
                                        fontSize: 12,
                                        textAlign: "center",
                                        paddingTop: 16,
                                    }}
                                >
                                    No payment data yet
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>

            {/* ── Row 3: Payment Method Split + Revenue by DoW ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                    marginBottom: 16,
                }}
            >
                {/* Payment Method Split */}
                <Card
                    title="Payment Method Split"
                    sub="Orders and revenue by payment provider"
                    filterSlot={
                        <>
                            <Pill
                                label="By Orders"
                                active={pmSort === "count"}
                                onClick={() => setPmSort("count")}
                            />
                            <Pill
                                label="By Revenue"
                                active={pmSort === "revenue"}
                                onClick={() => setPmSort("revenue")}
                            />
                        </>
                    }
                >
                    {loading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Sk key={i} h={28} />
                            ))}
                        </div>
                    ) : paymentMethodData.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {paymentMethodData.map((pm, i) => (
                                <ProgRow
                                    key={pm.method}
                                    label={pm.method}
                                    count={
                                        pmSort === "revenue"
                                            ? Math.round(pm.revenue)
                                            : pm.count
                                    }
                                    total={
                                        pmSort === "revenue"
                                            ? paymentMethodData.reduce(
                                                  (s, p) => s + p.revenue,
                                                  0
                                              )
                                            : ordersTotal
                                    }
                                    color={PM_COLORS[i % PM_COLORS.length]}
                                    extra={
                                        pmSort === "count"
                                            ? fmt(pm.revenue, currency)
                                            : `${num(pm.count)} orders`
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <div
                            style={{
                                color: "#aaa",
                                fontSize: 12,
                                textAlign: "center",
                                paddingTop: 16,
                            }}
                        >
                            No payment data yet
                        </div>
                    )}
                </Card>

                {/* Revenue by DoW */}
                <Card
                    title="Revenue by Day of Week"
                    sub="All-time revenue per weekday (Mon-Sun)"
                    filterSlot={
                        <>
                            <Pill
                                label="Total"
                                active={dowMode === "total"}
                                onClick={() => setDowMode("total")}
                            />
                            <Pill
                                label="Avg/Order"
                                active={dowMode === "avg"}
                                onClick={() => setDowMode("avg")}
                            />
                        </>
                    }
                >
                    {loading ? (
                        <div
                            style={{
                                display: "flex",
                                gap: 5,
                                alignItems: "flex-end",
                                height: 80,
                            }}
                        >
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        flex: 1,
                                        background: "#f3f4f6",
                                        borderRadius: "3px 3px 0 0",
                                        height: `${35 + i * 6}%`,
                                    }}
                                />
                            ))}
                        </div>
                    ) : dowChartData.length > 0 ? (
                        <>
                            <BarChart data={dowChartData} currency={currency} />
                            <div
                                style={{
                                    marginTop: 8,
                                    fontSize: 10,
                                    color: "#aaa",
                                    textAlign: "center",
                                }}
                            >
                                {dowMode === "avg"
                                    ? "Average revenue per order - Indigo = highest"
                                    : "Total revenue by day - Indigo = highest"}
                            </div>
                        </>
                    ) : (
                        <div
                            style={{
                                color: "#aaa",
                                fontSize: 12,
                                textAlign: "center",
                                paddingTop: 16,
                            }}
                        >
                            No data
                        </div>
                    )}
                </Card>
            </div>

            {/* ── Row 4: Top Products ── */}
            <Card
                title="Top Products by Revenue"
                sub="From paid/active orders only - requires order items to be available"
                className="mb-4"
                filterSlot={
                    <>
                        {([5, 10, 20] as const).map((n) => (
                            <Pill
                                key={n}
                                label={`Top ${n}`}
                                active={productLimit === n}
                                onClick={() => setProductLimit(n)}
                            />
                        ))}
                    </>
                }
            >
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Sk key={i} h={32} />
                        ))}
                    </div>
                ) : topProductsData.length > 0 ? (
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: 12,
                            }}
                        >
                            <thead>
                                <tr>
                                    {["#", "Product", "Units Sold", "Orders", "Revenue"].map(
                                        (h) => (
                                            <th
                                                key={h}
                                                style={{
                                                    textAlign:
                                                        h === "#" ||
                                                        h === "Units Sold" ||
                                                        h === "Orders" ||
                                                        h === "Revenue"
                                                            ? "right"
                                                            : "left",
                                                    padding: "6px 10px",
                                                    fontWeight: 600,
                                                    color: "#888",
                                                    borderBottom: "1px solid #f3f4f6",
                                                    whiteSpace: "nowrap",
                                                    fontSize: 11,
                                                }}
                                            >
                                                {h}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {topProductsData.map((p, i) => (
                                    <tr
                                        key={i}
                                        style={{
                                            background: i % 2 === 0 ? "#fafafa" : "#fff",
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding: "8px 10px",
                                                textAlign: "right",
                                                color: "#bbb",
                                                fontWeight: 700,
                                                width: 28,
                                            }}
                                        >
                                            {i + 1}
                                        </td>
                                        <td
                                            style={{
                                                padding: "8px 10px",
                                                color: "#222",
                                                fontWeight: 600,
                                                maxWidth: 320,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {p.title}
                                        </td>
                                        <td
                                            style={{
                                                padding: "8px 10px",
                                                textAlign: "right",
                                                color: "#555",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {num(p.quantity)}
                                        </td>
                                        <td
                                            style={{
                                                padding: "8px 10px",
                                                textAlign: "right",
                                                color: "#555",
                                            }}
                                        >
                                            {num(p.order_count)}
                                        </td>
                                        <td
                                            style={{
                                                padding: "8px 10px",
                                                textAlign: "right",
                                                color: "#111",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {fmt(p.revenue, currency)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div
                        style={{
                            color: "#aaa",
                            fontSize: 12,
                            textAlign: "center",
                            padding: "20px 0",
                        }}
                    >
                        No product data available - order items may not be loaded with relations.
                    </div>
                )}
            </Card>

            {/* ── Custom Period Revenue Calculator ── */}
            <Card
                title="Custom Period Revenue"
                sub="Calculate revenue for any specific date range"
                className="mb-4"
            >
                <div
                    style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-end",
                        flexWrap: "wrap",
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <label style={{ fontSize: 10, color: "#888", fontWeight: 600 }}>
                            START DATE
                        </label>
                        <input
                            type="date"
                            value={customStart}
                            max={today}
                            onChange={(e) => setCustomStart(e.target.value)}
                            style={{
                                padding: "7px 10px",
                                borderRadius: 8,
                                border: "1px solid #e5e7eb",
                                fontSize: 12,
                                color: "#374151",
                                background: "#fff",
                                outline: "none",
                            }}
                        />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <label style={{ fontSize: 10, color: "#888", fontWeight: 600 }}>
                            END DATE
                        </label>
                        <input
                            type="date"
                            value={customEnd}
                            max={today}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            style={{
                                padding: "7px 10px",
                                borderRadius: 8,
                                border: "1px solid #e5e7eb",
                                fontSize: 12,
                                color: "#374151",
                                background: "#fff",
                                outline: "none",
                            }}
                        />
                    </div>
                    <button
                        onClick={fetchCustomPeriod}
                        disabled={customLoading || !customStart || !customEnd}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "7px 16px",
                            borderRadius: 8,
                            border: "none",
                            background: customLoading ? "#c7d2fe" : "#6366f1",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: customLoading ? "not-allowed" : "pointer",
                        }}
                    >
                        <ChartPie style={{ width: 13, height: 13 }} />
                        {customLoading ? "Calculating..." : "Calculate Revenue"}
                    </button>
                </div>

                {customError && (
                    <div
                        style={{
                            marginTop: 12,
                            padding: "8px 12px",
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: 8,
                            color: "#dc2626",
                            fontSize: 12,
                        }}
                    >
                        {customError}
                    </div>
                )}

                {customResult && (
                    <div style={{ marginTop: 16 }}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                                gap: 10,
                                marginBottom: 14,
                            }}
                        >
                            {[
                                {
                                    label: "Revenue",
                                    value: fmt(customResult.revenue, customResult.currency),
                                    color: "#6366f1",
                                },
                                {
                                    label: "Total Orders",
                                    value: num(customResult.total_orders),
                                    color: "#3b82f6",
                                },
                                {
                                    label: "Paid Orders",
                                    value: num(customResult.revenue_orders),
                                    color: "#22c55e",
                                },
                                {
                                    label: "Cancelled",
                                    value: num(customResult.cancelled_orders),
                                    color: "#ef4444",
                                },
                                {
                                    label: "Avg Order Value",
                                    value: fmt(
                                        customResult.avg_order_value,
                                        customResult.currency
                                    ),
                                    color: "#ec4899",
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    style={{
                                        background: "#fafafa",
                                        border: "1px solid #f0f0f0",
                                        borderRadius: 10,
                                        padding: "12px 14px",
                                        borderTop: `3px solid ${item.color}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 16,
                                            fontWeight: 700,
                                            color: "#111",
                                        }}
                                    >
                                        {item.value}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: "#888",
                                            marginTop: 2,
                                        }}
                                    >
                                        {item.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {customResult.daily_breakdown &&
                            customResult.daily_breakdown.length > 1 && (
                                <div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: "#888",
                                            marginBottom: 8,
                                        }}
                                    >
                                        DAILY REVENUE - {customResult.start_date} to{" "}
                                        {customResult.end_date}
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 3,
                                            alignItems: "flex-end",
                                            height: 60,
                                        }}
                                    >
                                        {customResult.daily_breakdown.map((d, i) => {
                                            const maxRev = Math.max(
                                                ...customResult.daily_breakdown.map(
                                                    (x) => x.revenue
                                                ),
                                                1
                                            )
                                            const h = Math.max(
                                                (d.revenue / maxRev) * 100,
                                                2
                                            )
                                            return (
                                                <div
                                                    key={i}
                                                    style={{
                                                        flex: 1,
                                                        background:
                                                            d.revenue === maxRev
                                                                ? "#6366f1"
                                                                : "#c7d2fe",
                                                        borderRadius: "3px 3px 0 0",
                                                        height: `${h}%`,
                                                        minHeight: 2,
                                                        transition: "height 0.5s ease",
                                                    }}
                                                    title={`${d.date} - ${fmt(d.revenue, customResult.currency)} - ${d.orders} orders`}
                                                />
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                    </div>
                )}
            </Card>

            {/* ── Quick Navigation ── */}
            <Card title="Quick Navigation" sub="Jump to any section">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: 8,
                    }}
                >
                    {QUICK_LINKS.map((l) => (
                        <QuickLink key={l.href} {...l} />
                    ))}
                </div>
            </Card>

            <div
                style={{
                    textAlign: "right",
                    fontSize: 10,
                    color: "#ddd",
                    marginTop: 12,
                }}
            >
                Alariya Admin - Analytics Dashboard
            </div>
        </div>
    )
}

export const config = defineRouteConfig({
    label: "Analytics",
    icon: ChartBar,
})

export default AnalyticsDashboardPage
