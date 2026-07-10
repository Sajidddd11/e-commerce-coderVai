import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
    CurrencyDollar,
    Plus,
    Trash,
    MagnifyingGlass,
    Calendar,
    ArrowPath,
    ChartBar,
    Tag,
    ListBullet,
    CheckCircle,
    ExclamationCircle,
    ArchiveBox,
} from "@medusajs/icons"
import { useState, useEffect, useCallback } from "react"

// ─── Dark Mode Hook ────────────────────────────────────────────────────────────
function useIsDark() {
    const [dark, setDark] = useState(() =>
        typeof document !== "undefined" && document.documentElement.classList.contains("dark")
    )
    useEffect(() => {
        const el = document.documentElement
        const obs = new MutationObserver(() => setDark(el.classList.contains("dark")))
        obs.observe(el, { attributes: true, attributeFilter: ["class"] })
        return () => obs.disconnect()
    }, [])
    return dark
}

// ─── Reusable Spinner ─────────────────────────────────────────────────────────
function ProfessionalSpinner({ size = 36 }: { size?: number }) {
    return (
        <svg 
            className="animate-spin" 
            viewBox="0 0 24 24" 
            style={{ 
                width: size, 
                height: size, 
                color: "var(--ui-fg-base, #000000)",
                display: "inline-block",
                verticalAlign: "middle"
            }}
        >
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" style={{ opacity: 0.15 }} />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: 0.85 }} />
        </svg>
    )
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExpenseCategory {
    id: string
    name: string
    description?: string
}

interface Expense {
    id: string
    amount: number
    description?: string
    date: string
    category_id: string
    category?: ExpenseCategory
}

interface Variant {
    id: string
    title: string
    prices?: { currency_code: string; amount: number }[]
}

interface Product {
    id: string
    title: string
    thumbnail?: string
    variants: Variant[]
}

interface FinanceStats {
    revenue: number
    cogs: number
    expenses: number
    profit: number
    category_breakdown: { id: string; name: string; amount: number }[]
}

// ─── Styling Helper ───────────────────────────────────────────────────────────
const S = {
    page: {
        padding: "24px 32px",
        fontFamily: "Inter, system-ui, sans-serif",
        maxWidth: "100%",
        color: "var(--ui-fg-base)",
    } as React.CSSProperties,
    card: {
        background: "var(--ui-bg-base)",
        border: "1px solid var(--ui-border-base, rgba(127, 127, 127, 0.45))",
        borderRadius: 12,
        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
        padding: 24,
        marginBottom: 24,
        overflow: "hidden",
    } as React.CSSProperties,
    statCard: {
        background: "var(--ui-bg-base)",
        border: "1px solid var(--ui-border-base, rgba(127, 127, 127, 0.45))",
        borderRadius: 12,
        padding: "24px 20px",
        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
        flex: 1,
        minWidth: 240,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    } as React.CSSProperties,
    tabs: {
        display: "flex",
        gap: 24,
        borderBottom: "1px solid var(--ui-border-base, rgba(127, 127, 127, 0.45))",
        marginBottom: 28,
    } as React.CSSProperties,
    tabBtn: (active: boolean) => ({
        padding: "12px 4px",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        background: "transparent",
        color: active ? "var(--ui-fg-base)" : "var(--ui-fg-muted)",
        border: "none",
        borderBottom: active ? "2px solid var(--ui-border-interactive, #3b82f6)" : "2px solid transparent",
        transition: "all 0.15s ease",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        marginBottom: -1,
    } as React.CSSProperties),
    btn: (variant: "primary" | "danger" | "secondary" = "secondary") => ({
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        border: "1px solid",
        transition: "all 0.15s",
        ...(variant === "primary"
            ? { background: "var(--ui-button-inverted-bg)", color: "var(--ui-button-inverted-fg)", borderColor: "var(--ui-button-inverted-border)" }
            : variant === "danger"
                ? { background: "var(--ui-bg-error-subtle, #fef2f2)", color: "var(--ui-fg-error, #ef4444)", borderColor: "var(--ui-border-error, #fca5a5)" }
                : { background: "var(--ui-bg-base)", color: "var(--ui-fg-base)", borderColor: "var(--ui-border-base)" }),
    } as React.CSSProperties),
    input: {
        padding: "8px 12px",
        border: "1px solid rgba(127, 127, 127, 0.35)",
        borderRadius: 8,
        fontSize: 13,
        outline: "none",
        background: "var(--ui-bg-field, transparent)",
        color: "var(--ui-fg-base)",
    } as React.CSSProperties,
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 13,
        textAlign: "left",
    } as React.CSSProperties,
    th: {
        padding: "12px 16px",
        borderBottom: "1px solid var(--ui-border-base)",
        fontWeight: 600,
        color: "var(--ui-fg-muted)",
        fontSize: 12,
        textTransform: "uppercase",
    } as React.CSSProperties,
    td: {
        padding: "12px 16px",
        borderBottom: "1px solid var(--ui-border-base)",
        color: "var(--ui-fg-base)",
        verticalAlign: "middle",
    } as React.CSSProperties,
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        backdropFilter: "blur(2px)",
    } as React.CSSProperties,
    modal: {
        background: "var(--ui-bg-base)",
        border: "1px solid var(--ui-border-base)",
        borderRadius: 14,
        width: "100%",
        maxWidth: 480,
        padding: 24,
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    } as React.CSSProperties,
}

const PRESETS = [
    { key: "today", label: "Today" },
    { key: "7d", label: "Last 7d" },
    { key: "30d", label: "Last 30d" },
    { key: "all", label: "All Time" },
    { key: "custom", label: "Custom" },
] as const

type Preset = (typeof PRESETS)[number]["key"]

export default function ExpensesPage() {
    const isDark = useIsDark()
    const [tab, setTab] = useState<"dashboard" | "buying_prices" | "expenses" | "categories">("dashboard")
    
    // Expense Tracker filtering/pagination state
    const [expenseSearch, setExpenseSearch] = useState("")
    const [expenseCategoryFilter, setExpenseCategoryFilter] = useState("all")
    const [expenseCurrentPage, setExpenseCurrentPage] = useState(1)
    const [expenseStartDate, setExpenseStartDate] = useState("")
    const [expenseEndDate, setExpenseEndDate] = useState("")
    
    // Date filter state
    const [preset, setPreset] = useState<Preset>("30d")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    // API Data state
    const [loading, setLoading] = useState(true)
    const [statsLoading, setStatsLoading] = useState(false)
    const [stats, setStats] = useState<FinanceStats | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [buyingPrices, setBuyingPrices] = useState<Record<string, number>>({})
    const [categories, setCategories] = useState<ExpenseCategory[]>([])
    const [expenses, setExpenses] = useState<Expense[]>([])

    // Editing states
    const [searchQuery, setSearchQuery] = useState("")
    const [draftPrices, setDraftPrices] = useState<Record<string, string>>({})
    const [savingPrices, setSavingPrices] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

    // Modal forms states
    const [showExpenseModal, setShowExpenseModal] = useState(false)
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [expenseForm, setExpenseForm] = useState({ amount: "", description: "", date: new Date().toISOString().split("T")[0], category_id: "" })
    const [categoryForm, setCategoryForm] = useState({ name: "", description: "" })
    const [submittingForm, setSubmittingForm] = useState(false)

    // Compute query parameters for date filter
    const getStatsQueryParams = useCallback(() => {
        const params = new URLSearchParams()
        if (preset === "custom") {
            if (startDate) params.append("start_date", startDate)
            if (endDate) params.append("end_date", endDate)
        } else if (preset !== "all") {
            const now = new Date()
            const todayStr = now.toISOString().split("T")[0]
            params.append("end_date", todayStr)
            
            if (preset === "today") {
                params.append("start_date", todayStr)
            } else if (preset === "7d") {
                const d = new Date()
                d.setDate(d.getDate() - 6)
                params.append("start_date", d.toISOString().split("T")[0])
            } else if (preset === "30d") {
                const d = new Date()
                d.setDate(d.getDate() - 29)
                params.append("start_date", d.toISOString().split("T")[0])
            }
        }
        return params.toString()
    }, [preset, startDate, endDate])

    // Load main dashboard / config statistics
    const loadStats = useCallback(async () => {
        setStatsLoading(true)
        try {
            const qStr = getStatsQueryParams()
            const res = await fetch(`/admin/finance/stats?${qStr}`, { credentials: "include" })
            const data = await res.json()
            if (res.ok) {
                setStats(data.stats)
            }
        } catch (err) {
            console.error("Failed to load stats", err)
        } finally {
            setStatsLoading(false)
        }
    }, [getStatsQueryParams])

    // Core loader for all entities
    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            // Trigger all requests in parallel
            const [prodRes, priceRes, catRes, expRes] = await Promise.all([
                fetch(
                    "/admin/products?limit=200&fields=id,title,thumbnail,*variants,variants.prices.amount,variants.prices.currency_code",
                    { credentials: "include" }
                ),
                fetch("/admin/finance/buying-prices", { credentials: "include" }),
                fetch("/admin/finance/categories", { credentials: "include" }),
                fetch("/admin/finance/expenses", { credentials: "include" }),
                loadStats(), // Stats loader runs in parallel as well
            ])

            // Parse json responses in parallel
            const [prodData, priceData, catData, expData] = await Promise.all([
                prodRes.json(),
                priceRes.json(),
                catRes.json(),
                expRes.json(),
            ])

            if (prodRes.ok) {
                setProducts(prodData.products || [])
            }

            if (priceRes.ok) {
                const mapped: Record<string, number> = {}
                priceData.prices.forEach((bp: any) => {
                    mapped[bp.variant_id] = bp.buying_price
                })
                setBuyingPrices(mapped)
                
                // Initialize draft prices
                const drafts: Record<string, string> = {}
                priceData.prices.forEach((bp: any) => {
                    drafts[bp.variant_id] = String(bp.buying_price)
                })
                setDraftPrices(drafts)
            }

            if (catRes.ok) {
                setCategories(catData.categories || [])
                if (catData.categories?.length > 0) {
                    setExpenseForm(prev => ({ ...prev, category_id: catData.categories[0].id }))
                }
            }

            if (expRes.ok) {
                setExpenses(expData.expenses || [])
            }
        } catch (error) {
            console.error("Failed loading dashboard data", error)
        } finally {
            setLoading(false)
        }
    }, [loadStats])

    // Trigger loader on mount & date filter change
    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        loadStats()
    }, [preset, startDate, endDate, loadStats])

    // Toast auto-clear
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 4000)
            return () => clearTimeout(t)
        }
    }, [toast])

    // --- Actions ---
    
    // Save variant buying prices in batch
    const handleSavePrices = async () => {
        setSavingPrices(true)
        const payload: { variant_id: string; buying_price: number }[] = []
        
        Object.entries(draftPrices).forEach(([vid, priceStr]) => {
            const priceNum = parseFloat(priceStr)
            if (!isNaN(priceNum) && priceNum >= 0) {
                payload.push({ variant_id: vid, buying_price: priceNum })
            }
        })

        try {
            const res = await fetch("/admin/finance/buying-prices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prices: payload }),
                credentials: "include"
            })
            const data = await res.json()
            if (res.ok) {
                setToast({ message: "Buying prices saved successfully", type: "success" })
                // Refresh buying prices and stats
                const newPrices: Record<string, number> = {}
                payload.forEach(item => {
                    newPrices[item.variant_id] = item.buying_price
                })
                setBuyingPrices(prev => ({ ...prev, ...newPrices }))
                loadStats()
            } else {
                setToast({ message: data.message || "Failed to save prices", type: "error" })
            }
        } catch (error: any) {
            setToast({ message: error.message || "Connection error", type: "error" })
        } finally {
            setSavingPrices(false)
        }
    }

    // Create Expense Category
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!categoryForm.name.trim()) return
        
        setSubmittingForm(true)
        try {
            const res = await fetch("/admin/finance/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(categoryForm),
                credentials: "include"
            })
            const data = await res.json()
            if (res.ok) {
                setToast({ message: "Category created successfully", type: "success" })
                setCategories(prev => [...prev, data.category])
                setExpenseForm(prev => ({ ...prev, category_id: prev.category_id || data.category.id }))
                setCategoryForm({ name: "", description: "" })
                setShowCategoryModal(false)
            } else {
                setToast({ message: data.message || "Failed to create category", type: "error" })
            }
        } catch (error: any) {
            setToast({ message: error.message || "Connection error", type: "error" })
        } finally {
            setSubmittingForm(false)
        }
    }

    // Delete Expense Category
    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category? Any expenses in this category will display as uncategorized.")) return
        try {
            const res = await fetch(`/admin/finance/categories/${id}`, {
                method: "DELETE",
                credentials: "include"
            })
            if (res.ok) {
                setToast({ message: "Category deleted successfully", type: "success" })
                setCategories(prev => prev.filter(c => c.id !== id))
                loadStats()
            }
        } catch (error: any) {
            setToast({ message: "Failed to delete category", type: "error" })
        }
    }

    // Record Expense
    const handleCreateExpense = async (e: React.FormEvent) => {
        e.preventDefault()
        const amountNum = parseFloat(expenseForm.amount)
        if (isNaN(amountNum) || amountNum <= 0 || !expenseForm.category_id) {
            setToast({ message: "Please input valid amount and select category", type: "error" })
            return
        }

        setSubmittingForm(true)
        try {
            const res = await fetch("/admin/finance/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: amountNum,
                    description: expenseForm.description,
                    date: expenseForm.date,
                    category_id: expenseForm.category_id
                }),
                credentials: "include"
            })
            const data = await res.json()
            if (res.ok) {
                setToast({ message: "Expense logged successfully", type: "success" })
                // Populate category object for display table
                const catObj = categories.find(c => c.id === expenseForm.category_id)
                const loggedExpense = { ...data.expense, category: catObj }
                
                setExpenses(prev => [loggedExpense, ...prev])
                setExpenseForm(prev => ({ ...prev, amount: "", description: "" }))
                setShowExpenseModal(false)
                loadStats()
            } else {
                setToast({ message: data.message || "Failed to log expense", type: "error" })
            }
        } catch (error: any) {
            setToast({ message: error.message || "Connection error", type: "error" })
        } finally {
            setSubmittingForm(false)
        }
    }

    // Delete Expense
    const handleDeleteExpense = async (id: string) => {
        if (!confirm("Delete this expense record?")) return
        try {
            const res = await fetch(`/admin/finance/expenses/${id}`, {
                method: "DELETE",
                credentials: "include"
            })
            if (res.ok) {
                setToast({ message: "Expense deleted successfully", type: "success" })
                setExpenses(prev => prev.filter(e => e.id !== id))
                loadStats()
            }
        } catch (error: any) {
            setToast({ message: "Failed to delete expense", type: "error" })
        }
    }

    // Format money values (assuming default store currency is BDT or standard currency symbol is dynamically read, fall back to BDT ৳)
    const fmt = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "BDT",
            maximumFractionDigits: 0,
        }).format(amount)
    }

    // --- Render Helpers ---

    const renderDashboard = () => {
        if (!stats) return (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ui-fg-muted)" }}>
                <ProfessionalSpinner size={36} />
                <p style={{ fontSize: 13, fontWeight: 500, marginTop: 12 }}>Loading stats...</p>
            </div>
        )

        const totalCost = stats.cogs + stats.expenses
        const marginPct = stats.revenue > 0 ? (stats.profit / stats.revenue) * 100 : 0
        const cogsPct = stats.revenue > 0 ? (stats.cogs / stats.revenue) * 100 : 0
        const expPct = stats.revenue > 0 ? (stats.expenses / stats.revenue) * 100 : 0

        return (
            <div>
                {/* Preset Controls */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginBottom: 24 }}>
                    <div style={{
                        display: "flex",
                        background: "var(--ui-bg-subtle, #f3f4f6)",
                        border: "1px solid var(--ui-border-base)",
                        padding: 3,
                        borderRadius: 8,
                        gap: 2,
                    }}>
                        {PRESETS.map(p => {
                            const active = preset === p.key
                            return (
                                <button
                                    key={p.key}
                                    onClick={() => setPreset(p.key)}
                                    style={{
                                        border: "none",
                                        padding: "6px 14px",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        borderRadius: 6,
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                        background: active ? "var(--ui-bg-base)" : "transparent",
                                        color: active ? "var(--ui-fg-base)" : "var(--ui-fg-muted)",
                                        boxShadow: active ? "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px 0 rgba(0,0,0,0.04)" : "none",
                                    }}
                                >
                                    {p.label}
                                </button>
                            )
                        })}
                    </div>

                    {statsLoading && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ui-fg-interactive, #3b82f6)", fontSize: 13, fontWeight: 600 }}>
                            <ProfessionalSpinner size={16} />
                            <span>Updating stats...</span>
                        </div>
                    )}

                    {preset === "custom" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                style={{ ...S.input, padding: "6px 12px" }}
                            />
                            <span style={{ fontSize: 13, color: "var(--ui-fg-muted)", fontWeight: 500 }}>to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                style={{ ...S.input, padding: "6px 12px" }}
                            />
                        </div>
                    )}
                </div>

                <div style={{ opacity: statsLoading ? 0.6 : 1, transition: "opacity 0.25s ease-in-out" }}>

                {/* Stat Grid */}
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
                    <div style={S.statCard}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <span style={{ color: "var(--ui-fg-muted)", fontSize: 13, fontWeight: 600 }}>Revenue</span>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ChartBar style={{ width: 20, height: 20, color: "#3b82f6" }} />
                            </div>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>{fmt(stats.revenue)}</div>
                        <div style={{ fontSize: 12, color: "var(--ui-fg-muted)", marginTop: 8 }}>
                            Gross billing from store orders
                        </div>
                    </div>

                    <div style={S.statCard}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <span style={{ color: "var(--ui-fg-muted)", fontSize: 13, fontWeight: 600 }}>Cost of Goods (COGS)</span>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ArchiveBox style={{ width: 20, height: 20, color: "#ef4444" }} />
                            </div>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>{fmt(stats.cogs)}</div>
                        <div style={{ fontSize: 12, color: "var(--ui-fg-muted)", marginTop: 8 }}>
                            Variant buying price × sold quantity
                        </div>
                    </div>

                    <div style={S.statCard}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <span style={{ color: "var(--ui-fg-muted)", fontSize: 13, fontWeight: 600 }}>Other Expenses</span>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Tag style={{ width: 20, height: 20, color: "#f59e0b" }} />
                            </div>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>{fmt(stats.expenses)}</div>
                        <div style={{ fontSize: 12, color: "var(--ui-fg-muted)", marginTop: 8 }}>
                            Operational expenses tracked manually
                        </div>
                    </div>

                    <div style={S.statCard}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <span style={{ color: "var(--ui-fg-muted)", fontSize: 13, fontWeight: 600 }}>Net Profit</span>
                            <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: stats.profit >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(236, 72, 153, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <CurrencyDollar style={{ width: 20, height: 20, color: stats.profit >= 0 ? "#10b981" : "#ec4899" }} />
                            </div>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", color: stats.profit >= 0 ? "var(--ui-fg-success, #10b981)" : "var(--ui-fg-error, #f43f5e)" }}>
                            {fmt(stats.profit)}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ui-fg-muted)", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                            <span>Net Margin:</span>
                            <span style={{ fontWeight: 700, color: stats.profit >= 0 ? "#10b981" : "#ec4899" }}>
                                {marginPct.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Visual Share Bar */}
                <div style={S.card}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Revenue Allocation Breakdown</h3>
                    <div style={{ height: 12, borderRadius: 999, display: "flex", overflow: "hidden", background: "var(--ui-bg-subtle)", marginBottom: 20 }}>
                        {stats.revenue > 0 ? (
                            <>
                                {stats.cogs > 0 && (
                                    <div
                                        style={{ width: `${cogsPct}%`, background: "#ef4444" }}
                                        title={`COGS: ${cogsPct.toFixed(1)}%`}
                                    />
                                )}
                                {stats.expenses > 0 && (
                                    <div
                                        style={{ width: `${expPct}%`, background: "#f59e0b" }}
                                        title={`Expenses: ${expPct.toFixed(1)}%`}
                                    />
                                )}
                                {stats.profit > 0 && (
                                    <div
                                        style={{ width: `${marginPct}%`, background: "#10b981" }}
                                        title={`Profit: ${marginPct.toFixed(1)}%`}
                                    />
                                )}
                            </>
                        ) : (
                            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ui-fg-muted)", fontSize: 12 }}>
                                No Revenue recorded in this range.
                            </div>
                        )}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 32, fontSize: 13 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                            <span style={{ fontWeight: 500, color: "var(--ui-fg-muted)" }}>COGS:</span>
                            <span style={{ fontWeight: 600 }}>{fmt(stats.cogs)} ({cogsPct.toFixed(1)}%)</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                            <span style={{ fontWeight: 500, color: "var(--ui-fg-muted)" }}>Other Expenses:</span>
                            <span style={{ fontWeight: 600 }}>{fmt(stats.expenses)} ({expPct.toFixed(1)}%)</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                            <span style={{ fontWeight: 500, color: "var(--ui-fg-muted)" }}>Net Profit:</span>
                            <span style={{ fontWeight: 600, color: "#10b981" }}>{fmt(stats.profit)} ({marginPct.toFixed(1)}%)</span>
                        </div>
                    </div>
                </div>

                {/* Detailed analysis */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                    {/* Expense Breakdown */}
                    <div style={S.card}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, borderBottom: "1px solid var(--ui-border-base, rgba(127, 127, 127, 0.45))", paddingBottom: 8 }}>
                            Expenses by Category
                        </h3>
                        {stats.category_breakdown.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ui-fg-muted)", fontSize: 13 }}>
                                No expenses logged for this range.
                            </div>
                        ) : (() => {
                            const CHART_COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]
                            const breakdownWithColors = stats.category_breakdown.map((c, index) => ({
                                ...c,
                                color: CHART_COLORS[index % CHART_COLORS.length],
                                share: stats.expenses > 0 ? (c.amount / stats.expenses) * 100 : 0
                            }))

                            let currentPercent = 0
                            const conicParts = breakdownWithColors.map(c => {
                                const start = currentPercent
                                const end = currentPercent + c.share
                                currentPercent = end
                                return `${c.color} ${start.toFixed(1)}% ${end.toFixed(1)}%`
                            })

                            const conicGradient = stats.expenses > 0
                                ? `conic-gradient(${conicParts.join(", ")})`
                                : "var(--ui-bg-subtle, #e5e7eb)"

                            return (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", flexWrap: "wrap", gap: 24, padding: "8px 0" }}>
                                    {/* Donut/Pie Chart */}
                                    <div style={{
                                        width: 140,
                                        height: 140,
                                        borderRadius: "50%",
                                        background: conicGradient,
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.05)"
                                    }}>
                                        <div style={{
                                            width: 96,
                                            height: 96,
                                            borderRadius: "50%",
                                            background: isDark ? "#18181b" : "#ffffff",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                                        }}>
                                            <span style={{ fontSize: 10, color: "var(--ui-fg-muted)", fontWeight: 500, marginBottom: 2 }}>Total</span>
                                            <span style={{ color: "var(--ui-fg-base)" }}>{fmt(stats.expenses)}</span>
                                        </div>
                                    </div>

                                    {/* Categories List Legend */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 160 }}>
                                        {breakdownWithColors.map(c => (
                                            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, display: "inline-block" }} />
                                                    <span style={{ fontWeight: 600, color: "var(--ui-fg-base)" }}>{c.name}</span>
                                                </div>
                                                <div style={{ color: "var(--ui-fg-muted)", fontWeight: 500 }}>
                                                    {fmt(c.amount)} ({c.share.toFixed(0)}%)
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })()}
                    </div>

                    {/* Recent Transaction overview */}
                    <div style={S.card}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--ui-border-base)", paddingBottom: 8 }}>
                            Recent Activity
                        </h3>
                        {expenses.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ui-fg-muted)", fontSize: 13 }}>
                                No recent transactions recorded.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {expenses.slice(0, 5).map(e => (
                                    <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, paddingBottom: 8, borderBottom: "1px dashed var(--ui-border-base)" }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{e.description || "Uncoded Expense"}</div>
                                            <div style={{ fontSize: 11, color: "var(--ui-fg-muted)", display: "flex", gap: 8, marginTop: 2 }}>
                                                <span>{new Date(e.date).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span style={{ color: "var(--ui-fg-interactive)" }}>{e.category?.name || "Expense"}</span>
                                            </div>
                                        </div>
                                        <div style={{ color: "#ef4444", fontWeight: 700 }}>-{fmt(e.amount)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                </div>
            </div>
        )
    }

    const renderBuyingPrices = () => {
        // Filter products and their variants by search
        const filteredProducts = products.filter(p => {
            const matchesTitle = p.title.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesVariant = p.variants.some(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()))
            return matchesTitle || matchesVariant
        })

        return (
            <div style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                    <div style={{ position: "relative", width: "100%", maxWidth: 360 }}>
                        <MagnifyingGlass style={{ position: "absolute", left: 10, top: 10, width: 16, height: 16, color: "var(--ui-fg-muted)" }} />
                        <input
                            type="text"
                            placeholder="Search products or variants..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ ...S.input, paddingLeft: 34, width: "100%" }}
                        />
                    </div>

                    <button
                        onClick={handleSavePrices}
                        disabled={savingPrices}
                        style={S.btn("primary")}
                    >
                        {savingPrices ? (
                            <>
                                <ArrowPath className="animate-spin" style={{ width: 16, height: 16 }} />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle style={{ width: 16, height: 16 }} />
                                Save Buying Prices
                            </>
                        )}
                    </button>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={S.th}>Product</th>
                                <th style={S.th}>Variant</th>
                                <th style={S.th}>Selling Price (Base)</th>
                                <th style={S.th}>Buying Price (Cost)</th>
                                <th style={S.th}>Gross Margin (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(p =>
                                p.variants.map((v, index) => {
                                    // Get base price from Medusa (in minor units, usually cents/poisha, divide by 100)
                                    const bdtPriceObj = v.prices?.find(pr => pr.currency_code.toLowerCase() === "bdt")
                                    const sellingPrice = bdtPriceObj ? bdtPriceObj.amount : (v.prices?.[0]?.amount || 0)
                                    
                                    const buyingPriceVal = draftPrices[v.id] || ""
                                    const bpNum = parseFloat(buyingPriceVal)
                                    
                                    // Margin calculation
                                    let margin = "—"
                                    if (sellingPrice > 0 && !isNaN(bpNum) && bpNum > 0) {
                                        const marginVal = ((sellingPrice - bpNum) / sellingPrice) * 100
                                        margin = `${marginVal.toFixed(1)}%`
                                    }

                                    return (
                                        <tr key={v.id}>
                                            <td style={{ ...S.td, borderBottom: index === p.variants.length - 1 ? "1px solid var(--ui-border-base)" : "none" }}>
                                                {index === 0 && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        {p.thumbnail && (
                                                            <img
                                                                src={p.thumbnail}
                                                                alt={p.title}
                                                                style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }}
                                                            />
                                                        )}
                                                        <span style={{ fontWeight: 600 }}>{p.title}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td style={S.td}>
                                                <span style={{ background: "var(--ui-bg-subtle)", padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>
                                                    {v.title}
                                                </span>
                                            </td>
                                            <td style={S.td}>
                                                {sellingPrice > 0 ? fmt(sellingPrice) : "Not Configured"}
                                            </td>
                                            <td style={S.td}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <span style={{ color: "var(--ui-fg-muted)" }}>৳</span>
                                                    <input
                                                        type="number"
                                                        value={buyingPriceVal}
                                                        placeholder="Set Cost"
                                                        min="0"
                                                        step="0.01"
                                                        onChange={e => setDraftPrices(prev => ({ ...prev, [v.id]: e.target.value }))}
                                                        style={{ ...S.input, width: 110, padding: "4px 8px" }}
                                                    />
                                                </div>
                                            </td>
                                            <td style={{ ...S.td, fontWeight: 700, color: parseFloat(margin) < 15 ? "#ef4444" : "#10b981" }}>
                                                {margin}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}

                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ ...S.td, textAlign: "center", padding: "40px 0", color: "var(--ui-fg-muted)" }}>
                                        No products or variants found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    const renderExpenses = () => {
        // 1. Filter expenses by search text, category ID, and date range
        const filtered = expenses.filter(e => {
            const matchesSearch = !expenseSearch || 
                (e.description && e.description.toLowerCase().includes(expenseSearch.toLowerCase())) ||
                (e.category?.name && e.category.name.toLowerCase().includes(expenseSearch.toLowerCase()))
            const matchesCategory = expenseCategoryFilter === "all" || e.category_id === expenseCategoryFilter
            
            // Date filter logic
            const dateVal = new Date(e.date)
            let matchesStartDate = true
            let matchesEndDate = true
            if (expenseStartDate) {
                const start = new Date(expenseStartDate + "T00:00:00")
                matchesStartDate = dateVal >= start
            }
            if (expenseEndDate) {
                const end = new Date(expenseEndDate + "T23:59:59")
                matchesEndDate = dateVal <= end
            }
            
            return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate
        })

        // 2. Pagination variables
        const itemsPerPage = 10
        const totalPages = Math.ceil(filtered.length / itemsPerPage)
        const paginated = filtered.slice((expenseCurrentPage - 1) * itemsPerPage, expenseCurrentPage * itemsPerPage)

        return (
            <div style={S.card}>
                {/* Header with Title and Add Button */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Logged Expenses</h3>
                        <p style={{ fontSize: 12, color: "var(--ui-fg-muted)", marginTop: 2 }}>
                            Showing {filtered.length} total operational costs log entries.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowExpenseModal(true)}
                        style={S.btn("primary")}
                    >
                        <Plus style={{ width: 16, height: 16 }} />
                        Record Expense
                    </button>
                </div>

                {/* Filters Row */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                    {/* Search Field */}
                    <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
                        <MagnifyingGlass style={{ position: "absolute", left: 12, top: 11, width: 16, height: 16, color: "var(--ui-fg-muted)" }} />
                        <input
                          type="text"
                          placeholder="Search description or category..."
                          value={expenseSearch}
                          onChange={e => {
                              setExpenseSearch(e.target.value)
                              setExpenseCurrentPage(1)
                          }}
                          style={{ ...S.input, paddingLeft: 36, width: "100%" }}
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={expenseCategoryFilter}
                        onChange={e => {
                            setExpenseCategoryFilter(e.target.value)
                            setExpenseCurrentPage(1)
                        }}
                        style={{ ...S.input, minWidth: 200, background: "var(--ui-bg-field, transparent)" }}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {/* Date Range Filters */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                            type="date"
                            value={expenseStartDate}
                            onChange={e => {
                                setExpenseStartDate(e.target.value)
                                setExpenseCurrentPage(1)
                            }}
                            style={{ ...S.input, padding: "6px 12px" }}
                        />
                        <span style={{ fontSize: 13, color: "var(--ui-fg-muted)", fontWeight: 500 }}>to</span>
                        <input
                            type="date"
                            value={expenseEndDate}
                            onChange={e => {
                                setExpenseEndDate(e.target.value)
                                setExpenseCurrentPage(1)
                            }}
                            style={{ ...S.input, padding: "6px 12px" }}
                        />
                        {(expenseStartDate || expenseEndDate) && (
                            <button
                                onClick={() => {
                                    setExpenseStartDate("")
                                    setExpenseEndDate("")
                                    setExpenseCurrentPage(1)
                                }}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "var(--ui-fg-interactive, #3b82f6)",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    padding: "4px 8px"
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={S.th}>Date</th>
                                <th style={S.th}>Category</th>
                                <th style={S.th}>Description</th>
                                <th style={S.th}>Amount</th>
                                <th style={S.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map(e => (
                                <tr key={e.id}>
                                    <td style={S.td}>
                                        {new Date(e.date).toLocaleDateString()}
                                    </td>
                                    <td style={S.td}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--ui-bg-subtle)", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
                                            <Tag style={{ width: 10, height: 10 }} />
                                            {e.category?.name || "Uncategorized"}
                                        </span>
                                    </td>
                                    <td style={S.td}>
                                        {e.description || <span style={{ color: "var(--ui-fg-muted)", fontStyle: "italic" }}>No description</span>}
                                    </td>
                                    <td style={{ ...S.td, fontWeight: 700, color: "#ef4444" }}>
                                        -{fmt(e.amount)}
                                    </td>
                                    <td style={S.td}>
                                        <button
                                            onClick={() => handleDeleteExpense(e.id)}
                                            style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--ui-fg-muted)", padding: 4 }}
                                            title="Delete record"
                                        >
                                            <Trash style={{ width: 16, height: 16 }} />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {paginated.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ ...S.td, textAlign: "center", padding: "40px 0", color: "var(--ui-fg-muted)" }}>
                                        No operational logs match your query filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--ui-border-base, rgba(127,127,127,0.45))" }}>
                        <button
                            disabled={expenseCurrentPage === 1}
                            onClick={() => setExpenseCurrentPage(p => Math.max(1, p - 1))}
                            style={{
                                ...S.btn("secondary"),
                                opacity: expenseCurrentPage === 1 ? 0.5 : 1,
                                cursor: expenseCurrentPage === 1 ? "not-allowed" : "pointer"
                            }}
                        >
                            Previous
                        </button>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ui-fg-muted)" }}>
                            Page {expenseCurrentPage} of {totalPages}
                        </span>
                        <button
                            disabled={expenseCurrentPage === totalPages}
                            onClick={() => setExpenseCurrentPage(p => Math.min(totalPages, p + 1))}
                            style={{
                                ...S.btn("secondary"),
                                opacity: expenseCurrentPage === totalPages ? 0.5 : 1,
                                cursor: expenseCurrentPage === totalPages ? "not-allowed" : "pointer"
                            }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        )
    }

    const renderCategories = () => {
        return (
            <div style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Expense Categories</h3>
                        <p style={{ fontSize: 12, color: "var(--ui-fg-muted)", marginTop: 2 }}>
                            Categories group operational logs in metrics breakdown charts.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCategoryModal(true)}
                        style={S.btn("primary")}
                    >
                        <Plus style={{ width: 16, height: 16 }} />
                        Create Category
                    </button>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={S.table}>
                        <thead>
                            <tr>
                                <th style={S.th}>Name</th>
                                <th style={S.th}>Description</th>
                                <th style={S.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(c => (
                                <tr key={c.id}>
                                    <td style={{ ...S.td, fontWeight: 600 }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--ui-bg-subtle)", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                                            <Tag style={{ width: 12, height: 12 }} />
                                            {c.name}
                                        </span>
                                    </td>
                                    <td style={S.td}>
                                        {c.description || <span style={{ color: "var(--ui-fg-muted)", fontStyle: "italic" }}>No description provided</span>}
                                    </td>
                                    <td style={S.td}>
                                        <button
                                            onClick={() => handleDeleteCategory(c.id)}
                                            style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--ui-fg-muted)", padding: 4 }}
                                            title="Delete category"
                                        >
                                            <Trash style={{ width: 16, height: 16 }} />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={3} style={{ ...S.td, textAlign: "center", padding: "40px 0", color: "var(--ui-fg-muted)" }}>
                                        No categories found. Create a category to record expenses.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    return (
        <div style={S.page}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Finance Tracker</h1>
                    <p style={{ color: "var(--ui-fg-muted)", fontSize: 13, marginTop: 4 }}>
                        Monitor store buying costs, log operating expenses, and evaluate net profitability.
                    </p>
                </div>

                <button
                    onClick={loadData}
                    style={S.btn("secondary")}
                >
                    <ArrowPath style={{ width: 16, height: 16 }} />
                    Refresh
                </button>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: "fixed",
                    top: 24,
                    right: 24,
                    background: toast.type === "success" ? "var(--ui-bg-success-subtle, #ecfdf5)" : "var(--ui-bg-error-subtle, #fef2f2)",
                    color: toast.type === "success" ? "var(--ui-fg-success, #10b981)" : "var(--ui-fg-error, #f43f5e)",
                    border: `1px solid ${toast.type === "success" ? "var(--ui-border-success, #a7f3d0)" : "var(--ui-border-error, #fca5a5)"}`,
                    padding: "12px 20px",
                    borderRadius: 10,
                    zIndex: 99999,
                    fontSize: 13,
                    fontWeight: 600,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                }}>
                    {toast.type === "success" ? <CheckCircle style={{ width: 16, height: 16 }} /> : <ExclamationCircle style={{ width: 16, height: 16 }} />}
                    {toast.message}
                </div>
            )}

            {/* Tabs */}
            <div style={S.tabs}>
                <button
                    onClick={() => setTab("dashboard")}
                    style={S.tabBtn(tab === "dashboard")}
                >
                    <ChartBar style={{ width: 16, height: 16 }} />
                    Dashboard
                </button>
                <button
                    onClick={() => setTab("buying_prices")}
                    style={S.tabBtn(tab === "buying_prices")}
                >
                    <ArchiveBox style={{ width: 16, height: 16 }} />
                    Buying Prices
                </button>
                <button
                    onClick={() => setTab("expenses")}
                    style={S.tabBtn(tab === "expenses")}
                >
                    <ListBullet style={{ width: 16, height: 16 }} />
                    Expense Tracker
                </button>
                <button
                    onClick={() => setTab("categories")}
                    style={S.tabBtn(tab === "categories")}
                >
                    <Tag style={{ width: 16, height: 16 }} />
                    Expense Categories
                </button>
            </div>

            {/* Main Content View */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "120px 0", color: "var(--ui-fg-muted)" }}>
                    <ProfessionalSpinner size={40} />
                    <p style={{ fontSize: 13, fontWeight: 500, marginTop: 16, letterSpacing: "-0.01em" }}>
                        Loading financial data...
                    </p>
                </div>
            ) : (
                <>
                    {tab === "dashboard" && renderDashboard()}
                    {tab === "buying_prices" && renderBuyingPrices()}
                    {tab === "expenses" && renderExpenses()}
                    {tab === "categories" && renderCategories()}
                </>
            )}

            {/* Modal: Record Expense */}
            {showExpenseModal && (
                <div style={S.modalOverlay} onClick={() => setShowExpenseModal(false)}>
                    <div style={{ ...S.modal, background: isDark ? "#18181b" : "#ffffff" }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Record Operational Expense</h3>
                        <form onSubmit={handleCreateExpense} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ui-fg-muted)" }}>Amount (BDT)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="Enter expense amount"
                                    value={expenseForm.amount}
                                    onChange={e => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                                    style={S.input}
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ui-fg-muted)" }}>Category</label>
                                <select
                                    value={expenseForm.category_id}
                                    onChange={e => setExpenseForm(prev => ({ ...prev, category_id: e.target.value }))}
                                    style={{ ...S.input, background: "var(--ui-bg-field)" }}
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                    {categories.length === 0 && (
                                        <option value="" disabled>Please create a category first</option>
                                    )}
                                </select>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ui-fg-muted)" }}>Date</label>
                                <input
                                    type="date"
                                    required
                                    value={expenseForm.date}
                                    onChange={e => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                                    style={S.input}
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ui-fg-muted)" }}>Description (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Office electricity bill, Facebook Ads"
                                    value={expenseForm.description}
                                    onChange={e => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                                    style={S.input}
                                />
                            </div>

                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                                <button
                                    type="button"
                                    onClick={() => setShowExpenseModal(false)}
                                    style={S.btn("secondary")}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingForm || categories.length === 0}
                                    style={S.btn("primary")}
                                >
                                    {submittingForm ? "Submitting..." : "Log Expense"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: New Category */}
            {showCategoryModal && (
                <div style={S.modalOverlay} onClick={() => setShowCategoryModal(false)}>
                    <div style={{ ...S.modal, background: isDark ? "#18181b" : "#ffffff" }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Create Expense Category</h3>
                        <form onSubmit={handleCreateCategory} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ui-fg-muted)" }}>Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Marketing, Shipping, Office Rent"
                                    value={categoryForm.name}
                                    onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                                    style={S.input}
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ui-fg-muted)" }}>Description (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Description of category costs"
                                    value={categoryForm.description}
                                    onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                                    style={S.input}
                                />
                            </div>

                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryModal(false)}
                                    style={S.btn("secondary")}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingForm}
                                    style={S.btn("primary")}
                                >
                                    {submittingForm ? "Creating..." : "Create Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Route Config ─────────────────────────────────────────────────────────────
export const config = defineRouteConfig({
    label: "Finance Tracker",
    icon: CurrencyDollar,
})
