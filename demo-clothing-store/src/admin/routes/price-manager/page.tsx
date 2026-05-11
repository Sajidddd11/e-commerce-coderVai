import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CurrencyDollar, ArrowLeft, ChevronDown, ArrowPath, InformationCircle, PencilSquare, ExclamationCircle, CheckCircle, Plus, XMark, MagnifyingGlass } from "@medusajs/icons"
import { useState, useEffect, useCallback, Fragment, useRef } from "react"

// ─── Dark-mode detection ───────────────────────────────────────────────────────
// Medusa Admin toggles the `dark` class on <html>. We watch that so we can
// supply fully-opaque fallback colours wherever CSS variables might not resolve
// (e.g. position:fixed elements that land outside a scoped stylesheet).

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface PriceList {
    id: string
    title: string
    description?: string
    type: "sale" | "override"
    status: "active" | "draft"
    starts_at?: string
    ends_at?: string
    prices?: PriceRow[]
}

interface PriceRow {
    id: string
    variant_id: string
    currency_code: string
    amount: number
}

interface Variant {
    id: string
    title: string
    prices: { currency_code: string; amount: number }[]
    metadata?: Record<string, any>
    options?: { id: string; value: string; option_id: string }[]
}

interface Product {
    id: string
    title: string
    thumbnail?: string
    variants: Variant[]
    options?: { id: string; title: string }[]
}

// ─── Products cache ────────────────────────────────────────────────────────────
// Instead of fetching all 200 products (9.6 Mb, ~30s), use Medusa's built-in
// price_list_id filter — the same filter the native admin UI uses — so only the
// products actually linked to the current price list are returned.
// Results are cached per price list ID with a 5-minute TTL.

interface ProductsCache { data: Product[]; fetchedAt: number }
const _priceListProductsCache = new Map<string, ProductsCache>()
const PRODUCTS_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function fetchProductsForPriceList(priceListId: string, force = false): Promise<Product[]> {
    const now = Date.now()
    const cached = _priceListProductsCache.get(priceListId)
    if (!force && cached && now - cached.fetchedAt < PRODUCTS_CACHE_TTL) {
        return cached.data
    }
    const params = new URLSearchParams({ limit: "200" })
    params.append("price_list_id[0]", priceListId)
    const res = await fetch(`/admin/products?${params}`, { credentials: "include" })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to load products")
    const products: Product[] = data.products ?? []
    _priceListProductsCache.set(priceListId, { data: products, fetchedAt: now })
    return products
}

// ─── All-products cache (for "Add Products" modal) ────────────────────────────
// Cached separately so the modal doesn't re-fetch when opened multiple times.

let _allProductsCache: ProductsCache | null = null
const ALL_PRODUCTS_CACHE_TTL = 5 * 60 * 1000

async function fetchAllProducts(force = false): Promise<Product[]> {
    const now = Date.now()
    if (!force && _allProductsCache && now - _allProductsCache.fetchedAt < ALL_PRODUCTS_CACHE_TTL) {
        return _allProductsCache.data
    }
    // Include variant prices so base prices show immediately after adding a product.
    // *variants expands variants; variants.prices.* includes the nested price rows.
    const res = await fetch(
        "/admin/products?limit=200&fields=id,title,thumbnail,*variants,*options,variants.prices.id,variants.prices.amount,variants.prices.currency_code",
        { credentials: "include" }
    )
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to load products")
    const products: Product[] = data.products ?? []
    _allProductsCache = { data: products, fetchedAt: now }
    return products
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
    bdt: "৳",
    usd: "$",
    eur: "€",
    gbp: "£",
}

function sym(currency: string) {
    return CURRENCY_SYMBOLS[currency.toLowerCase()] ?? currency.toUpperCase()
}

function toDisplay(amount: number) {
    return Number(amount).toFixed(2)
}

function toRaw(display: string) {
    return parseFloat(display)
}

function formatDate(d?: string) {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
    page: {
        padding: 28,
        fontFamily: "Inter, system-ui, sans-serif",
        maxWidth: 1100,
        color: "var(--ui-fg-base)",
    } as React.CSSProperties,
    card: {
        background: "var(--ui-bg-base)",
        border: "1px solid rgba(127,127,127,0.35)",
        borderRadius: 14,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        overflow: "hidden",
        marginBottom: 10,
    } as React.CSSProperties,
    pill: (active: boolean) =>
    ({
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        background: active ? "var(--ui-tag-green-bg)" : "var(--ui-bg-subtle)",
        color: active ? "var(--ui-tag-green-text)" : "var(--ui-fg-muted)",
    } as React.CSSProperties),
    typePill: (type: string) =>
    ({
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        background: type === "sale" ? "var(--ui-tag-orange-bg)" : "var(--ui-tag-blue-bg)",
        color: type === "sale" ? "var(--ui-tag-orange-text)" : "var(--ui-tag-blue-text)",
    } as React.CSSProperties),
    btn: (variant: "primary" | "secondary" | "ghost" = "secondary") =>
    ({
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        border: "1px solid",
        transition: "all 0.15s",
        ...(variant === "primary"
            ? { background: "var(--ui-button-inverted-bg)", color: "var(--ui-button-inverted-fg)", borderColor: "var(--ui-button-inverted-border)" }
            : variant === "ghost"
                ? { background: "transparent", color: "var(--ui-fg-base)", borderColor: "transparent" }
                : { background: "var(--ui-bg-base)", color: "var(--ui-fg-base)", borderColor: "rgba(127,127,127,0.35)" }),
    } as React.CSSProperties),
    input: {
        width: "100%",
        padding: "5px 8px",
        border: "1px solid var(--ui-border-base)",
        borderRadius: 6,
        fontSize: 13,
        outline: "none",
        fontFamily: "monospace",
        color: "var(--ui-fg-base)",
        background: "var(--ui-bg-base)",
        boxSizing: "border-box",
    } as React.CSSProperties,
    th: {
        padding: "10px 14px",
        textAlign: "left",
        fontSize: 11,
        fontWeight: 700,
        color: "var(--ui-fg-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        background: "var(--ui-bg-subtle)",
        borderBottom: "2px solid rgba(127,127,127,0.45)",
        borderRight: "1px solid rgba(127,127,127,0.35)",
    } as React.CSSProperties,
    td: {
        padding: "10px 14px",
        fontSize: 13,
        verticalAlign: "middle",
        borderBottom: "1px solid rgba(127,127,127,0.35)",
        borderRight: "1px solid rgba(127,127,127,0.35)",
    } as React.CSSProperties,
}

// ─── Add Products Modal ───────────────────────────────────────────────────────

const AddProductsModal = ({
    existingProductIds,
    onAdd,
    onClose,
}: {
    existingProductIds: Set<string>
    onAdd: (products: Product[]) => Promise<void>
    onClose: () => void
}) => {
    const isDark = useIsDark()
    const bg     = isDark ? "#1a1a1f" : "#ffffff"
    const bgRow  = isDark ? "#1a1a1f" : "#ffffff"
    const bgSub  = isDark ? "#26262d" : "#f3f4f6"
    const bgSel  = isDark ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.08)"
    const fg     = isDark ? "#f1f1f3" : "#111827"
    const fgMut  = isDark ? "#9ca3af" : "#6b7280"
    const border = "rgba(127,127,127,0.25)"

    const [allProducts, setAllProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const searchRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        searchRef.current?.focus()
        fetchAllProducts().then(setAllProducts).catch((e) => setError(e.message)).finally(() => setLoading(false))
    }, [])

    const available = allProducts.filter(
        (p) => !existingProductIds.has(p.id) &&
            (!search || p.title.toLowerCase().includes(search.toLowerCase()))
    )

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const toggleAll = () => {
        if (selected.size === available.length) {
            setSelected(new Set())
        } else {
            setSelected(new Set(available.map((p) => p.id)))
        }
    }

    const handleAdd = async () => {
        const toAdd = allProducts.filter((p) => selected.has(p.id))
        if (toAdd.length === 0) return
        setAdding(true)
        try {
            await onAdd(toAdd)
        } finally {
            setAdding(false)
        }
        onClose()
    }

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 16,
                width: "min(560px, 92vw)",
                maxHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                color: fg,
            }}>
                {/* Modal header */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "18px 20px",
                    borderBottom: `1px solid ${border}`,
                    background: bg,
                    borderRadius: "16px 16px 0 0",
                }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: fg }}>Add Products</div>
                        <div style={{ fontSize: 12, color: fgMut, marginTop: 2 }}>
                            Select products to add to this price list
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: fgMut, padding: "4px 6px", borderRadius: 6, display: "flex" }}>
                        <XMark style={{ width: 16, height: 16 }} />
                    </button>
                </div>

                {/* Search */}
                <div style={{ padding: "12px 20px", borderBottom: `1px solid ${border}`, background: bg }}>
                    <div style={{ position: "relative" }}>
                        <MagnifyingGlass style={{
                            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                            width: 14, height: 14, color: fgMut, pointerEvents: "none",
                        }} />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search products…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: "100%", boxSizing: "border-box",
                                paddingLeft: 32, padding: "8px 12px 8px 32px",
                                border: `1px solid ${border}`,
                                borderRadius: 8, fontSize: 13, outline: "none",
                                background: bgSub, color: fg,
                            }}
                        />
                    </div>
                </div>

                {/* Product list */}
                <div style={{ overflowY: "auto", flex: 1, background: bg }}>
                    {loading && (
                        <div style={{ padding: "24px 20px", color: fgMut, fontSize: 13, textAlign: "center" }}>
                            Loading products…
                        </div>
                    )}
                    {error && (
                        <div style={{ padding: "12px 20px", color: "#f87171", fontSize: 13 }}>{error}</div>
                    )}
                    {!loading && available.length === 0 && (
                        <div style={{ padding: "40px 20px", textAlign: "center", color: fgMut, fontSize: 13 }}>
                            {search ? "No products match your search." : "All products are already in this price list."}
                        </div>
                    )}
                    {!loading && available.length > 0 && (
                        <>
                            {/* Select all row */}
                            <div
                                onClick={toggleAll}
                                style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    padding: "10px 20px",
                                    borderBottom: `1px solid ${border}`,
                                    cursor: "pointer",
                                    background: bgSub,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    readOnly
                                    checked={selected.size === available.length}
                                    style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#6366f1" }}
                                />
                                <span style={{ fontSize: 12, fontWeight: 600, color: fgMut }}>
                                    {selected.size === available.length ? "Deselect all" : `Select all (${available.length})`}
                                </span>
                            </div>
                            {available.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => toggle(p.id)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 12,
                                        padding: "11px 20px",
                                        borderBottom: `1px solid ${border}`,
                                        cursor: "pointer",
                                        background: selected.has(p.id) ? bgSel : bgRow,
                                        transition: "background 0.1s",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        readOnly
                                        checked={selected.has(p.id)}
                                        style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#6366f1", flexShrink: 0 }}
                                    />
                                    {p.thumbnail ? (
                                        <img src={p.thumbnail} alt={p.title} style={{ width: 32, height: 40, objectFit: "cover", borderRadius: 4, border: `1px solid ${border}`, flexShrink: 0 }} />
                                    ) : (
                                        <div style={{ width: 32, height: 40, background: bgSub, borderRadius: 4, border: `1px solid ${border}`, flexShrink: 0 }} />
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {p.title}
                                        </div>
                                        <div style={{ fontSize: 11, color: fgMut, marginTop: 2 }}>
                                            {p.variants?.length ?? 0} variant{(p.variants?.length ?? 0) !== 1 ? "s" : ""}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 20px",
                    borderTop: `1px solid ${border}`,
                    background: bg,
                    borderRadius: "0 0 16px 16px",
                    gap: 10,
                }}>
                    <span style={{ fontSize: 12, color: fgMut }}>
                        {selected.size > 0 ? `${selected.size} product${selected.size !== 1 ? "s" : ""} selected` : "No products selected"}
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={onClose} style={{ ...S.btn("secondary") }}>Cancel</button>
                        <button
                            onClick={handleAdd}
                            disabled={selected.size === 0 || adding}
                            style={{ ...S.btn("primary"), opacity: (selected.size === 0 || adding) ? 0.6 : 1 }}
                        >
                            <Plus style={{ width: 14, height: 14 }} />
                            {adding ? "Adding…" : `Add ${selected.size > 0 ? selected.size : ""} Product${selected.size !== 1 ? "s" : ""}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Price List Card (list view) ──────────────────────────────────────────────

const PriceListCard = ({
    pl,
    onSelect,
}: {
    pl: PriceList
    onSelect: (pl: PriceList) => void
}) => {
    const [hovered, setHovered] = useState(false)
    return (
        <div
            style={{
                ...S.card,
                cursor: "pointer",
                boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.09)" : S.card.boxShadow,
                transform: hovered ? "translateY(-1px)" : "none",
                transition: "all 0.15s",
            }}
            onClick={() => onSelect(pl)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: pl.type === "sale" ? "var(--ui-tag-orange-bg)" : "var(--ui-tag-blue-bg)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                        <CurrencyDollar style={{ width: 18, height: 18, color: pl.type === "sale" ? "var(--ui-tag-orange-text)" : "var(--ui-tag-blue-text)" }} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{pl.title}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={S.typePill(pl.type)}>{pl.type === "sale" ? "Sale" : "Override"}</span>
                            <span style={S.pill(pl.status === "active")}>{pl.status === "active" ? "Active" : "Draft"}</span>
                            {pl.description && (
                                <span style={{ fontSize: 12, color: "var(--ui-fg-muted)" }}>{pl.description}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: "var(--ui-fg-muted)", marginBottom: 2 }}>Duration</div>
                        <div style={{ fontSize: 12, color: "var(--ui-fg-base)", fontWeight: 600 }}>
                            {formatDate(pl.starts_at)} → {formatDate(pl.ends_at)}
                        </div>
                    </div>
                    <ChevronDown style={{ color: "var(--ui-fg-muted)", transform: "rotate(-90deg)" }} />
                </div>
            </div>
        </div>
    )
}

// ─── Price Editor View ────────────────────────────────────────────────────────

const PriceEditor = ({
    priceList,
    onBack,
}: {
    priceList: PriceList
    onBack: () => void
}) => {
    const [products, setProducts] = useState<Product[]>([])
    const [existingPrices, setExistingPrices] = useState<PriceRow[]>([])
    const [overrides, setOverrides] = useState<Record<string, Record<string, string>>>({})
    const [currencies, setCurrencies] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
    const [showAddProducts, setShowAddProducts] = useState(false)

    const fetchData = useCallback(async (forceRefreshProducts = false) => {
        try {
            setLoading(true)
            setError(null)

            // Both fire in parallel — price list is always fresh, products are cached
            // per price list ID and filtered server-side (no more loading all 200 products).
            const [plRes, prods] = await Promise.all([
                fetch(`/admin/price-lists/${priceList.id}`, { credentials: "include" }),
                fetchProductsForPriceList(priceList.id, forceRefreshProducts),
            ])

            const plData = await plRes.json()
            if (!plRes.ok) throw new Error(plData.message || "Failed to load price list")

            const prices: PriceRow[] = plData.price_list?.prices ?? []
            setExistingPrices(prices)

            // Build initial override map: { [variantId]: { [CURRENCY]: "displayValue" } }
            const initOverrides: Record<string, Record<string, string>> = {}
            prices.forEach((p) => {
                if (!p.variant_id) return
                if (!initOverrides[p.variant_id]) initOverrides[p.variant_id] = {}
                initOverrides[p.variant_id][p.currency_code.toUpperCase()] = toDisplay(p.amount)
            })
            setOverrides(initOverrides)

            setProducts(prods)
            setExpandedProducts(new Set())
            collectCurrencies(prods, prices)

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data")
        } finally {
            setLoading(false)
        }
    }, [priceList.id])

    function collectCurrencies(prods: Product[], existingPrices: PriceRow[]) {
        const set = new Set<string>()
        // Primary: variant base prices from product data
        prods.forEach((p) =>
            p.variants?.forEach((v) =>
                v.prices?.forEach((pr) => set.add(pr.currency_code.toUpperCase()))
            )
        )
        // Fallback: currencies from the price list overrides (in case base prices not returned)
        if (set.size === 0) {
            existingPrices.forEach((p) => set.add(p.currency_code.toUpperCase()))
        }
        setCurrencies(Array.from(set))
    }

    useEffect(() => { fetchData() }, [fetchData])

    const setOverride = (variantId: string, currency: string, value: string) => {
        setOverrides((prev) => ({
            ...prev,
            [variantId]: { ...(prev[variantId] ?? {}), [currency]: value },
        }))
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            setError(null)
            setSuccessMsg(null)

            const create: any[] = []
            const update: any[] = []
            const del: string[] = []

            const processedPriceIds = new Set<string>()

            Object.entries(overrides).forEach(([variantId, currMap]) => {
                Object.entries(currMap).forEach(([currency, displayVal]) => {
                    const cleanVal = displayVal.trim()
                    const lowerCur = currency.toLowerCase()
                    const rawAmount = cleanVal && !isNaN(parseFloat(cleanVal)) ? toRaw(cleanVal) : null

                    const existing = existingPrices.find(
                        (p) => p.variant_id === variantId && p.currency_code === lowerCur
                    )

                    if (existing) {
                        processedPriceIds.add(existing.id)
                        if (rawAmount === null) {
                            del.push(existing.id)
                        } else if (existing.amount !== rawAmount) {
                            update.push({ id: existing.id, amount: rawAmount })
                        }
                    } else if (rawAmount !== null) {
                        create.push({
                            variant_id: variantId,
                            currency_code: lowerCur,
                            amount: rawAmount,
                        })
                    }
                })
            })

            if (create.length === 0 && update.length === 0 && del.length === 0) {
                setSaving(false)
                setSuccessMsg("No changes detected.")
                return
            }

            const res = await fetch(`/admin/price-lists/${priceList.id}/prices/batch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ create, update, delete: del }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Save failed")

            const totalSaved = create.length + update.length + del.length
            setSuccessMsg(`Processed ${totalSaved} price change${totalSaved !== 1 ? "s" : ""} successfully`)
            fetchData()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Save failed")
        } finally {
            setSaving(false)
        }
    }

    const toggleProduct = (productId: string) => {
        setExpandedProducts((prev) => {
            const next = new Set(prev)
            next.has(productId) ? next.delete(productId) : next.add(productId)
            return next
        })
    }

    const handleAddProducts = async (newProds: Product[]) => {
        if (newProds.length === 0) return

        // Products already come from the all-products cache which includes
        // variant prices — no individual re-fetch needed (those take 30-50s each).
        setProducts((prev) => [...prev, ...newProds])

        setExpandedProducts((prev) => {
            const next = new Set(prev)
            newProds.forEach((p) => next.add(p.id))
            return next
        })

        setCurrencies((prev) => {
            const set = new Set(prev)
            newProds.forEach((p) =>
                p.variants?.forEach((v) =>
                    v.prices?.forEach((pr) => set.add(pr.currency_code.toUpperCase()))
                )
            )
            existingPrices.forEach((p) => set.add(p.currency_code.toUpperCase()))
            return Array.from(set)
        })

        setSuccessMsg(`Added ${newProds.length} product${newProds.length !== 1 ? "s" : ""}. Fill in prices then save.`)
    }

    return (
        <div style={S.page}>
            <style>{`
                input[type="number"]::-webkit-outer-spin-button,
                input[type="number"]::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type="number"] { -moz-appearance: textfield; }
            `}</style>

            {/* Add Products modal */}
            {showAddProducts && (
                <AddProductsModal
                    existingProductIds={new Set(products.map((p) => p.id))}
                    onAdd={handleAddProducts}
                    onClose={() => setShowAddProducts(false)}
                />
            )}

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button onClick={onBack} style={{ ...S.btn("ghost"), padding: "6px 10px" }}>
                        <ArrowLeft style={{ width: 16, height: 16 }} />
                    </button>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: priceList.type === "sale" ? "var(--ui-tag-orange-bg)" : "var(--ui-tag-blue-bg)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <CurrencyDollar style={{ color: priceList.type === "sale" ? "var(--ui-tag-orange-text)" : "var(--ui-tag-blue-text)", width: 20, height: 20 }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{priceList.title}</h1>
                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            <span style={S.typePill(priceList.type)}>{priceList.type === "sale" ? "Sale" : "Override"}</span>
                            <span style={S.pill(priceList.status === "active")}>{priceList.status === "active" ? "Active" : "Draft"}</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => fetchData(true)} style={S.btn("secondary")} disabled={loading}>
                        <ArrowPath style={{ width: 14, height: 14 }} />
                        Refresh
                    </button>
                    <button onClick={() => setShowAddProducts(true)} style={S.btn("secondary")} disabled={loading}>
                        <Plus style={{ width: 14, height: 14 }} />
                        Add Products
                    </button>
                    <button
                        onClick={handleSave}
                        style={{ ...S.btn("primary"), opacity: saving ? 0.7 : 1 }}
                        disabled={saving}
                    >
                        {saving ? "Saving…" : "Save All Overrides"}
                    </button>
                </div>
            </div>

            {/* Feedback */}
            {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "var(--ui-tag-red-bg)", border: "1px solid var(--ui-tag-red-border)", borderRadius: 10, marginBottom: 16, fontSize: 13, color: "var(--ui-tag-red-text)" }}>
                    <ExclamationCircle style={{ width: 16, height: 16 }} />
                    {error}
                </div>
            )}
            {successMsg && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "var(--ui-tag-green-bg)", border: "1px solid var(--ui-tag-green-border)", borderRadius: 10, marginBottom: 16, fontSize: 13, color: "var(--ui-tag-green-text)" }}>
                    <CheckCircle style={{ width: 16, height: 16 }} />
                    {successMsg}
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{ height: 56, borderRadius: 12, background: "var(--ui-bg-subtle)", animation: "pulse 1.5s ease-in-out infinite" }} />
                    ))}
                </div>
            )}

            {/* Legend */}
            {!loading && currencies.length > 0 && (
                <div style={{ display: "flex", gap: 16, marginBottom: 16, padding: "10px 16px", background: "var(--ui-bg-subtle)", borderRadius: 10, border: "1px solid var(--ui-border-base)", fontSize: 12, color: "var(--ui-fg-muted)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><InformationCircle style={{ width: 14, height: 14 }} /> <strong>Grey values</strong> = base prices</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><PencilSquare style={{ width: 14, height: 14 }} /> <strong>White inputs</strong> = overrides</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ui-fg-interactive)" }} /> Blue border = value differs</span>
                </div>
            )}

            {/* Products */}
            {!loading && products.map((product) => {
                const isExpanded = expandedProducts.has(product.id)
                return (
                    <div key={product.id} style={{ ...S.card, marginBottom: 14 }}>
                        {/* Product header */}
                        <button
                            onClick={() => toggleProduct(product.id)}
                            style={{
                                width: "100%", padding: "14px 20px", display: "flex",
                                alignItems: "center", justifyContent: "space-between",
                                background: "none", border: "none", cursor: "pointer",
                                borderBottom: isExpanded ? "1px solid var(--ui-border-base)" : "none",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                {product.thumbnail ? (
                                    <img
                                        src={product.thumbnail}
                                        alt={product.title}
                                        style={{ width: 28, height: 36, objectFit: "cover", borderRadius: 4, border: "1px solid var(--ui-border-base)" }}
                                    />
                                ) : (
                                    <div style={{ width: 28, height: 36, background: "var(--ui-bg-subtle)", borderRadius: 4, border: "1px solid var(--ui-border-base)" }} />
                                )}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ui-fg-base)" }}>{product.title}</span>
                                    <span style={{ fontSize: 11, color: "var(--ui-fg-muted)", fontWeight: 500 }}>
                                        {product.variants?.length ?? 0} variants
                                    </span>
                                </div>
                            </div>
                            <ChevronDown style={{
                                color: "var(--ui-fg-muted)",
                                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s"
                            }} />
                        </button>

                        {/* Variants table */}
                        {isExpanded && (
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            <th style={{ ...S.th, width: "25%" }}>Variant</th>
                                            {currencies.map((cur) => (
                                                <th key={cur} style={{ ...S.th, textAlign: "center" }} colSpan={2}>
                                                    {cur} {sym(cur)}
                                                </th>
                                            ))}
                                        </tr>
                                        <tr>
                                            <th style={{ ...S.th, fontSize: 10 }}></th>
                                            {currencies.map((cur) => (
                                                <Fragment key={cur}>
                                                    <th style={{ ...S.th, fontSize: 10, fontWeight: 600, color: "var(--ui-fg-muted)", textAlign: "center" }}>
                                                        Base Price
                                                    </th>
                                                    <th style={{ ...S.th, fontSize: 10, fontWeight: 600, color: "var(--ui-fg-base)", textAlign: "center" }}>
                                                        Override
                                                    </th>
                                                </Fragment>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {product.variants?.map((variant, vIdx) => {
                                            const rowBg = vIdx % 2 === 0 ? "var(--ui-bg-base)" : "var(--ui-bg-subtle)"

                                            // Determine if it's a perfume
                                            const isPerfume = product.options?.some(o => o.title?.toLowerCase() === 'volume') &&
                                                product.options?.some(o => o.title?.toLowerCase().includes('bottle'))

                                            let imageUrl = variant.metadata?.image_url as string || null
                                            if (!imageUrl && isPerfume) {
                                                const bottleOpt = variant.options?.find(o => o.value?.match(/^(\d+)mltype(\d+)$/i))
                                                if (bottleOpt) {
                                                    const match = bottleOpt.value.match(/^(\d+)mltype(\d+)$/i)
                                                    if (match) imageUrl = `/Bottles/${match[1]}mlt${match[2]}.jpg`
                                                }
                                            }

                                            return (
                                                <tr key={variant.id} style={{ background: rowBg }}>
                                                    <td style={{ ...S.td, fontWeight: 600, color: "var(--ui-fg-base)" }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            {isPerfume && imageUrl && (
                                                                <div style={{
                                                                    width: 28, height: 28, background: 'var(--ui-bg-base)',
                                                                    border: '1px solid var(--ui-border-base)', borderRadius: 4,
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    flexShrink: 0
                                                                }}>
                                                                    <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                                </div>
                                                            )}
                                                            <span>{variant.title}</span>
                                                        </div>
                                                    </td>
                                                    {currencies.map((cur) => {
                                                        const basePrice = variant.prices?.find(
                                                            (p) => p.currency_code.toUpperCase() === cur
                                                        )
                                                        const baseDisplay = basePrice ? toDisplay(basePrice.amount) : ""
                                                        const overrideVal = overrides[variant.id]?.[cur] ?? ""
                                                        // numeric comparison — "100" vs "100.00" must not count as different
                                                        const isDifferent =
                                                            overrideVal !== "" &&
                                                            baseDisplay !== "" &&
                                                            parseFloat(overrideVal) !== parseFloat(baseDisplay)

                                                        return (
                                                            <Fragment key={cur}>
                                                                {/* Base price (read-only) */}
                                                                <td style={{ ...S.td, textAlign: "right", width: "15%" }}>
                                                                    <div style={{
                                                                        display: "inline-block",
                                                                        padding: "5px 8px",
                                                                        background: "var(--ui-bg-subtle)",
                                                                        borderRadius: 6,
                                                                        fontFamily: "monospace",
                                                                        fontSize: 13,
                                                                        color: "var(--ui-fg-muted)",
                                                                        border: "1px solid var(--ui-border-base)",
                                                                    }}>
                                                                        {baseDisplay ? `${sym(cur)} ${baseDisplay}` : "—"}
                                                                    </div>
                                                                </td>
                                                                {/* Override input */}
                                                                <td style={{ ...S.td, textAlign: "left", width: "20%" }}>
                                                                    <div style={{ position: "relative", maxWidth: 160 }}>
                                                                        <span style={{
                                                                            position: "absolute", left: 8, top: "50%",
                                                                            transform: "translateY(-50%)",
                                                                            fontSize: 12, color: "var(--ui-fg-muted)", pointerEvents: "none",
                                                                        }}>
                                                                            {sym(cur)}
                                                                        </span>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            min="0"
                                                                            placeholder={baseDisplay || "0.00"}
                                                                            value={overrideVal}
                                                                            onChange={(e) => setOverride(variant.id, cur, e.target.value)}
                                                                            style={{
                                                                                ...S.input,
                                                                                paddingLeft: 22,
                                                                                border: isDifferent
                                                                                    ? "1.5px solid var(--ui-fg-interactive)"
                                                                                    : overrideVal
                                                                                        ? "1.5px solid var(--ui-border-strong)"
                                                                                        : "1px solid var(--ui-border-base)",
                                                                                background: overrideVal ? "var(--ui-bg-base)" : "var(--ui-bg-subtle)",
                                                                                boxShadow: isDifferent ? "0 0 0 1px var(--ui-fg-interactive)" : "none",
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </td>
                                                            </Fragment>
                                                        )
                                                    })}
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )
            })}

            {!loading && products.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ui-fg-muted)" }}>
                    <CurrencyDollar style={{ width: 48, height: 48, color: "var(--ui-fg-muted)", margin: "0 auto 12px" }} />
                    <p style={{ fontSize: 14 }}>No products linked to this price list yet.</p>
                    <button onClick={() => setShowAddProducts(true)} style={{ ...S.btn("secondary"), margin: "0 auto", display: "inline-flex" }}>
                        <Plus style={{ width: 14, height: 14 }} />
                        Add Products
                    </button>
                </div>
            )}

            {/* Bottom Save */}
            {!loading && products.length > 0 && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, gap: 10 }}>
                    <button onClick={onBack} style={S.btn("secondary")}>Cancel</button>
                    <button
                        onClick={handleSave}
                        style={{ ...S.btn("primary"), opacity: saving ? 0.7 : 1 }}
                        disabled={saving}
                    >
                        {saving ? "Saving…" : "Save All Overrides"}
                    </button>
                </div>
            )}
        </div>
    )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const PriceManagerPage = () => {
    const [priceLists, setPriceLists] = useState<PriceList[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selected, setSelected] = useState<PriceList | null>(null)
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState<"all" | "sale" | "override">("all")

    const fetchLists = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            // Only fetch the fields shown in the list view — avoids loading thousands
            // of nested price rows that the API includes by default.
            const res = await fetch(
                "/admin/price-lists?limit=100&fields=id,title,description,type,status,starts_at,ends_at",
                { credentials: "include" }
            )
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || "Failed to load price lists")
            setPriceLists(data.price_lists ?? [])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchLists() }, [fetchLists])

    if (selected) {
        return <PriceEditor priceList={selected} onBack={() => setSelected(null)} />
    }

    const visible = priceLists.filter((pl) => {
        const matchSearch = !search || pl.title.toLowerCase().includes(search.toLowerCase())
        const matchType = typeFilter === "all" || pl.type === typeFilter
        return matchSearch && matchType
    })

    return (
        <div style={S.page}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "var(--ui-bg-interactive)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <CurrencyDollar style={{ width: 22, height: 22, color: "var(--ui-fg-on-inverted)" }} />
                </div>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Price Manager</h1>
                    <p style={{ fontSize: 12, color: "var(--ui-fg-muted)", margin: "2px 0 0" }}>
                        Edit price list overrides with base price reference — {priceLists.length} price list{priceLists.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                <input
                    type="text"
                    placeholder="Search price lists…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        padding: "8px 14px", border: "1px solid rgba(127,127,127,0.35)",
                        borderRadius: 8, fontSize: 13, outline: "none",
                        width: 240, color: "var(--ui-fg-base)", background: "var(--ui-bg-base)",
                    }}
                />
                <div style={{ display: "flex", gap: 6 }}>
                    {(["all", "sale", "override"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            style={{
                                ...S.btn(typeFilter === t ? "primary" : "secondary"),
                                padding: "7px 14px", fontSize: 12,
                            }}
                        >
                            {t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
                <button onClick={fetchLists} style={{ ...S.btn("secondary"), marginLeft: "auto" }}>
                    <ArrowPath style={{ width: 14, height: 14 }} />
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "var(--ui-tag-red-bg)", border: "1px solid var(--ui-tag-red-border)", borderRadius: 10, marginBottom: 16, fontSize: 13, color: "var(--ui-tag-red-text)" }}>
                    <ExclamationCircle style={{ width: 16, height: 16 }} />
                    {error}
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{ height: 72, borderRadius: 14, background: "var(--ui-bg-subtle)" }} />
                    ))}
                </div>
            )}

            {/* Price list cards */}
            {!loading && visible.map((pl) => (
                <PriceListCard key={pl.id} pl={pl} onSelect={setSelected} />
            ))}

            {!loading && visible.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ui-fg-muted)" }}>
                    <CurrencyDollar style={{ width: 48, height: 48, color: "var(--ui-fg-muted)", margin: "0 auto 12px" }} />
                    <p style={{ fontSize: 14 }}>No price lists found.</p>
                </div>
            )}
        </div>
    )
}

// ─── Route Config ─────────────────────────────────────────────────────────────

export const config = defineRouteConfig({
    label: "Price Manager",
    icon: CurrencyDollar,
})

export default PriceManagerPage
