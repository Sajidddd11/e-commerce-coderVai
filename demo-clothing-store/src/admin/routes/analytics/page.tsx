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

// ─── Shared skeleton ──────────────────────────────────────────────────────────
const Sk = ({ h = 20, w = "100%" }: { h?: number; w?: string | number }) => (
    <div
        style={{
            height: h,
            width: w,
            borderRadius: 6,
        }}
        className="bg-ui-bg-subtle animate-pulse"
    />
)

// ─── Trend Badge ──────────────────────────────────────────────────────────────
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
                        <div className="text-[10px] text-ui-fg-muted mt-0.5">
                            {sub}
                        </div>
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
}: {
    title: string
    sub?: string
    children: React.ReactNode
    className?: string
}) => (
    <div
        className={`bg-ui-bg-base rounded-xl p-5 border border-ui-border-base shadow-sm ${className}`}
    >
        <div className="mb-3.5">
            <div className="text-[13px] font-bold text-ui-fg-base">{title}</div>
            {sub && (
                <div className="text-[11px] text-ui-fg-muted mt-0.5">{sub}</div>
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
                    <span className="text-xs text-ui-fg-subtle capitalize">
                        {label}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-ui-fg-base">
                        {num(count)}
                    </span>
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
                    style={{
                        width: `${w}%`,
                        background: color,
                    }}
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
    shortLabel = false,
}: {
    data: { date?: string; day?: string; revenue: number; orders: number }[]
    currency: string
    highlightLast?: boolean
    shortLabel?: boolean
}) => {
    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
    const maxIdx = data.reduce(
        (best, d, i) => (d.revenue > data[best].revenue ? i : best),
        0
    )
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
        <div
            style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 80 }}
        >
            {data.map((d, i) => {
                const h = Math.max((d.revenue / maxRevenue) * 100, 2)
                const isHighlight = highlightLast ? i === data.length - 1 : i === maxIdx

                let label = ""
                if (d.day) {
                    label = shortLabel ? d.day.slice(0, 3) : d.day.slice(0, 3)
                } else if (d.date) {
                    const dt = new Date(d.date + "T00:00:00")
                    label = days[dt.getDay()]
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
                            style={{
                                height: `${h}%`,
                            }}
                        />
                        <span
                            className={`text-[9px] ${
                                isHighlight ? "text-ui-fg-base font-bold" : "text-ui-fg-muted"
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

    // Custom period state
    const today = new Date().toISOString().split("T")[0]
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

    const fetchStats = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch("/admin/stats", { credentials: "include" })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            setStats(await res.json())
            setLastRefreshed(new Date())
        } catch (e: any) {
            setError(e?.message ?? "Failed to load analytics")
        } finally {
            setLoading(false)
        }
    }

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

    const currency = stats?.currency || "BDT"
    const revenueTrend = stats
        ? pct(stats.revenue.this_month, stats.revenue.prev_month)
        : null
    const ordersTotal = stats?.orders.total || 0
    const statusBreakdown = stats?.orders.status_breakdown || {}
    const paymentBreakdown = stats?.orders.payment_status_breakdown || {}

    // DOW: rotate so Monday is first
    const dowData = stats?.revenue_by_dow
        ? [
            ...stats.revenue_by_dow.slice(1), // Mon–Sat
            stats.revenue_by_dow[0], // Sun
        ]
        : []

    return (
        <div
            style={{
                padding: "24px",
                fontFamily: "Inter, system-ui, sans-serif",
            }}
        >
            {/* ── Header ── */}
            <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-9.5 h-9.5 rounded-xl bg-ui-bg-subtle flex items-center justify-center">
                        <ChartBar className="text-ui-fg-interactive w-4.5 h-4.5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-extrabold text-ui-fg-base m-0">
                            Company Analytics
                        </h1>
                        <p className="text-ui-fg-muted text-[11px] m-0 mt-0.5">
                            Refreshed: {lastRefreshed.toLocaleTimeString()}
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-ui-border-base bg-ui-bg-base text-ui-fg-base text-[12px] font-semibold cursor-pointer disabled:not-allowed disabled:opacity-70"
                >
                    <ArrowPath className="w-3.5 h-3.5" />
                    {loading ? "Refreshing…" : "Refresh"}
                </button>
            </div>

            {/* ── Error banner ── */}
            {error && (
                <div className="flex items-center gap-2 bg-ui-tag-red-bg border border-ui-tag-red-border rounded-lg px-3.5 py-2.5 mb-4 text-ui-tag-red-text text-[12px]">
                    <ExclamationCircle className="w-3.5 h-3.5 shrink-0" />
                    {error}
                </div>
            )}

            {/* ── Unfulfilled Orders Alert ── */}
            {!loading &&
                stats &&
                stats.unfulfilled_orders.count > 0 && (
                    <div className="flex items-center gap-2.5 bg-ui-tag-orange-bg border border-ui-tag-orange-border rounded-lg px-4 py-2.5 mb-4">
                        <ExclamationCircle className="w-4 h-4 text-ui-tag-orange-text shrink-0" />
                        <div className="flex-1">
                            <span className="text-[13px] font-bold text-ui-tag-orange-text">
                                {stats.unfulfilled_orders.count} order
                                {stats.unfulfilled_orders.count !== 1 ? "s" : ""} stuck
                                in Pending &gt; 24 hours
                            </span>
                            <span className="text-[12px] text-ui-tag-orange-text opacity-80 ml-1.5">
                                (oldest: {stats.unfulfilled_orders.oldest_hours}h ago)
                            </span>
                        </div>
                        <a
                            href="/app/orders-with-address"
                            className="text-[12px] font-semibold text-ui-tag-orange-text no-underline whitespace-nowrap hover:underline"
                        >
                            View Orders →
                        </a>
                    </div>
                )}

            {/* ── Row 1: 8 KPI Cards ── */}
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
                    icon={<ShoppingCart style={{ width: 16, height: 16 }} />}
                    label="Total Orders"
                    value={num(stats?.orders.total ?? 0)}
                    sub={`Today: ${num(stats?.orders.today ?? 0)} · Month: ${num(stats?.orders.this_month ?? 0)}`}
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
                    accent={
                        (stats?.cancellation_rate ?? 0) > 15 ? "#ef4444" : "#f97316"
                    }
                    iconBg={
                        (stats?.cancellation_rate ?? 0) > 15 ? "#fef2f2" : "#fff7ed"
                    }
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

            {/* ── Row 2: 7-day trend + Order Status + Payment Status ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.3fr 1fr 1fr",
                    gap: 14,
                    marginBottom: 16,
                }}
            >
                {/* 7-day Revenue */}
                <Card title="Revenue — Last 7 Days" sub="Cancelled/refunded excluded · hover bars for details">
                    {loading ? (
                        <div
                            style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 80 }}
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
                    ) : stats?.revenue_trend ? (
                        <>
                            <BarChart
                                data={stats.revenue_trend}
                                currency={currency}
                                highlightLast
                            />
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
                                        label: "Week Revenue",
                                        val: fmt(stats.revenue.this_week, currency),
                                    },
                                    {
                                        label: "Orders (7d)",
                                        val: num(stats.orders.this_week),
                                    },
                                    {
                                        label: "AOV (7d)",
                                        val:
                                            stats.orders.this_week > 0
                                                ? fmt(
                                                    stats.revenue.this_week /
                                                    stats.orders.this_week,
                                                    currency
                                                )
                                                : "—",
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
                <Card title="Order Status" sub="All orders by current status">
                    {loading ? (
                        <div
                            style={{ display: "flex", flexDirection: "column", gap: 8 }}
                        >
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Sk key={i} h={26} />
                            ))}
                        </div>
                    ) : (
                        <div
                            style={{ display: "flex", flexDirection: "column", gap: 8 }}
                        >
                            {Object.entries(ORDER_STATUS).map(([key, meta]) => {
                                const count = statusBreakdown[key] || 0
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
                        </div>
                    )}
                </Card>

                {/* Payment Status */}
                <Card title="Payment Status" sub="Payment collection status breakdown">
                    {loading ? (
                        <div
                            style={{ display: "flex", flexDirection: "column", gap: 8 }}
                        >
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Sk key={i} h={26} />
                            ))}
                        </div>
                    ) : (
                        <div
                            style={{ display: "flex", flexDirection: "column", gap: 8 }}
                        >
                            {Object.entries(PAYMENT_STATUS).map(([key, meta]) => {
                                const count = paymentBreakdown[key] || 0
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

            {/* ── Row 3: Payment Method Split + Revenue by Day of Week ── */}
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
                >
                    {loading ? (
                        <div
                            style={{ display: "flex", flexDirection: "column", gap: 8 }}
                        >
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Sk key={i} h={28} />
                            ))}
                        </div>
                    ) : stats?.payment_method_split &&
                        stats.payment_method_split.length > 0 ? (
                        <div
                            style={{ display: "flex", flexDirection: "column", gap: 8 }}
                        >
                            {stats.payment_method_split.map((pm, i) => (
                                <ProgRow
                                    key={pm.method}
                                    label={pm.method}
                                    count={pm.count}
                                    total={ordersTotal}
                                    color={PM_COLORS[i % PM_COLORS.length]}
                                    extra={fmt(pm.revenue, currency)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div
                            style={{ color: "#aaa", fontSize: 12, textAlign: "center", paddingTop: 16 }}
                        >
                            No payment data yet
                        </div>
                    )}
                </Card>

                {/* Revenue by Day of Week */}
                <Card
                    title="Revenue by Day of Week"
                    sub="All-time revenue averaged per weekday (Mon–Sun)"
                >
                    {loading ? (
                        <div
                            style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 80 }}
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
                    ) : dowData.length > 0 ? (
                        <>
                            <BarChart data={dowData} currency={currency} />
                            <div
                                style={{
                                    marginTop: 8,
                                    fontSize: 10,
                                    color: "#aaa",
                                    textAlign: "center",
                                }}
                            >
                                Indigo bar = highest revenue day
                            </div>
                        </>
                    ) : (
                        <div
                            style={{ color: "#aaa", fontSize: 12, textAlign: "center", paddingTop: 16 }}
                        >
                            No data
                        </div>
                    )}
                </Card>
            </div>

            {/* ── Row 4: Top Products ── */}
            <Card
                title="Top 5 Products by Revenue"
                sub="From paid/active orders only · requires order items to be available"
                style={{ marginBottom: 16 }}
            >
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Sk key={i} h={32} />
                        ))}
                    </div>
                ) : stats?.top_products && stats.top_products.length > 0 ? (
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
                                                    textAlign: h === "#" || h === "Units Sold" || h === "Orders" || h === "Revenue" ? "right" : "left",
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
                                {stats.top_products.map((p, i) => (
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
                        style={{ color: "#aaa", fontSize: 12, textAlign: "center", padding: "20px 0" }}
                    >
                        No product data available — order items may not be loaded with relations.
                    </div>
                )}
            </Card>

            {/* ── Row 5: Custom Period Revenue Calculator ── */}
            <Card
                title="Custom Period Revenue"
                sub="Calculate revenue for any specific date range"
                style={{ marginBottom: 16 }}
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
                        <label
                            style={{ fontSize: 10, color: "#888", fontWeight: 600 }}
                        >
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
                        <label
                            style={{ fontSize: 10, color: "#888", fontWeight: 600 }}
                        >
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
                            background:
                                customLoading ? "#c7d2fe" : "#6366f1",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: customLoading ? "not-allowed" : "pointer",
                        }}
                    >
                        <ChartPie style={{ width: 13, height: 13 }} />
                        {customLoading ? "Calculating…" : "Calculate Revenue"}
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
                        {/* Summary Cards */}
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
                                    value: fmt(customResult.avg_order_value, customResult.currency),
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
                                        style={{ fontSize: 10, color: "#888", marginTop: 2 }}
                                    >
                                        {item.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Daily breakdown chart */}
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
                                        DAILY REVENUE —{" "}
                                        {customResult.start_date} → {customResult.end_date}
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
                                                    title={`${d.date}\n${fmt(d.revenue, customResult.currency)}\n${d.orders} orders`}
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
                Alariya Admin · Analytics Dashboard
            </div>
        </div>
    )
}

export const config = defineRouteConfig({
    label: "Analytics",
    icon: ChartBar,
})

export default AnalyticsDashboardPage
