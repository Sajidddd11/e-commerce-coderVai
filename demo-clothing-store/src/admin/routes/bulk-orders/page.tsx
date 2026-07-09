import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Table, Badge, Input, Label, Switch, toast, Toaster } from "@medusajs/ui"
import { Trash, ArchiveBox, Plus } from "@medusajs/icons"
import { useEffect, useState, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type BulkProduct = {
    id: string
    product_id: string
    is_active: boolean
    min_quantity: number | null
    notes: string | null
    created_at: string
}

type MedusaProduct = {
    id: string
    title: string
    handle: string
    thumbnail: string | null
    variants?: { calculated_price?: { calculated_amount?: number; currency_code?: string } }[]
}

// ─── Component ────────────────────────────────────────────────────────────────

const BulkOrdersPage = () => {
    const [bulkProducts, setBulkProducts] = useState<BulkProduct[]>([])
    const [productDetails, setProductDetails] = useState<Record<string, MedusaProduct>>({})
    const [loading, setLoading] = useState(true)

    // Add product form state
    const [showAddForm, setShowAddForm] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<MedusaProduct[]>([])
    const [searching, setSearching] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<MedusaProduct | null>(null)
    const [minQuantity, setMinQuantity] = useState("")
    const [notes, setNotes] = useState("")
     const [submitting, setSubmitting] = useState(false)
     const [errorMsg, setErrorMsg] = useState("")
 
     // ── Settings State ─────────────────────────────────────────────────────────
     const [settings, setSettings] = useState({
         phone_enabled: true,
         phone_number: "8801304117711",
         whatsapp_enabled: true,
         whatsapp_number: "8801304117711",
         whatsapp_message: "Hi, I'm interested in placing a bulk order from ZAHAN. Please share your bulk pricing details.",
         email_enabled: true,
         email_address: "info@zahan.com",
         livechat_enabled: false,
         livechat_provider: "tawk.to",
         livechat_crisp_id: "",
         livechat_tawk_property_id: "",
         livechat_tawk_widget_id: "",
     })
     const [savingSettings, setSavingSettings] = useState(false)

    // ── Fetch bulk list ────────────────────────────────────────────────────────
    const fetchBulkProducts = useCallback(async () => {
        try {
            const res = await fetch("/admin/bulk-products", { credentials: "include" })
            const data = await res.json()
            const list: BulkProduct[] = data.bulk_products || []
            setBulkProducts(list)

            // Fetch product details for each product_id in parallel
            if (list.length > 0) {
                const uniqueIds = [...new Set(list.map((b) => b.product_id))]
                const details: Record<string, MedusaProduct> = {}
                await Promise.all(
                    uniqueIds.map(async (pid) => {
                        try {
                            const r = await fetch(`/admin/products/${pid}`, { credentials: "include" })
                            if (r.ok) {
                                const d = await r.json()
                                details[pid] = d.product
                            }
                        } catch { /* ignore */ }
                    })
                )
                setProductDetails(details)
            }
        } catch (err) {
            console.error("Error fetching bulk products:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchSettings = useCallback(async () => {
        try {
            const res = await fetch("/admin/bulk-products/settings", { credentials: "include" })
            if (res.ok) {
                const data = await res.json()
                if (data.settings) {
                    setSettings(data.settings)
                }
            }
        } catch (err) {
            console.error("Error fetching settings:", err)
        }
    }, [])

    const saveSettings = async () => {
        setSavingSettings(true)
        try {
            const res = await fetch("/admin/bulk-products/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(settings),
            })
            if (res.ok) {
                toast.success("Settings updated successfully")
                await fetchSettings()
            } else {
                toast.error("Failed to update settings")
            }
        } catch (err) {
            toast.error("Error saving settings")
        } finally {
            setSavingSettings(false)
        }
    }

    useEffect(() => {
        fetchBulkProducts()
        fetchSettings()
    }, [fetchBulkProducts, fetchSettings])

    // ── Search products ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([])
            return
        }
        const timer = setTimeout(async () => {
            setSearching(true)
            try {
                const res = await fetch(
                    `/admin/products?q=${encodeURIComponent(searchQuery)}&limit=10`,
                    { credentials: "include" }
                )
                const data = await res.json()
                setSearchResults(data.products || [])
            } catch { /* ignore */ } finally {
                setSearching(false)
            }
        }, 350)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // ── Toggle active ──────────────────────────────────────────────────────────
    const toggleActive = async (item: BulkProduct) => {
        try {
            await fetch(`/admin/bulk-products/${item.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ is_active: !item.is_active }),
            })
            await fetchBulkProducts()
        } catch (err) {
            console.error("Error toggling:", err)
        }
    }

    // ── Delete ─────────────────────────────────────────────────────────────────
    const deleteItem = async (id: string) => {
        if (!confirm("Remove this product from the bulk list?")) return
        try {
            await fetch(`/admin/bulk-products/${id}`, {
                method: "DELETE",
                credentials: "include",
            })
            await fetchBulkProducts()
        } catch (err) {
            console.error("Error deleting:", err)
        }
    }

    // ── Add product ────────────────────────────────────────────────────────────
    const handleAddProduct = async () => {
        if (!selectedProduct) return
        setSubmitting(true)
        setErrorMsg("")
        try {
            const res = await fetch("/admin/bulk-products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    product_id: selectedProduct.id,
                    min_quantity: minQuantity ? Number(minQuantity) : null,
                    notes: notes || null,
                    is_active: true,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setErrorMsg(data.message || "Failed to add product")
                return
            }
            // Reset form
            setShowAddForm(false)
            setSelectedProduct(null)
            setSearchQuery("")
            setSearchResults([])
            setMinQuantity("")
            setNotes("")
            await fetchBulkProducts()
        } catch (err) {
            setErrorMsg("Something went wrong")
        } finally {
            setSubmitting(false)
        }
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center h-64 bg-ui-bg-subtle rounded-xl border border-ui-border-base">
                    <p className="text-ui-fg-muted font-medium animate-pulse">Loading bulk orders...</p>
                </div>
            </Container>
        )
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            {/* Left Column: Products List */}
            <div className="xl:col-span-2">
                <Container>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <Heading level="h1">Bulk Orders</Heading>
                            <p className="text-sm text-ui-fg-subtle mt-1 max-w-[540px]">
                                Mark products as available for bulk purchase. Customers can contact you from the storefront Bulk Order page.
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => {
                                setShowAddForm((v) => !v)
                                setErrorMsg("")
                            }}
                        >
                            <Plus />
                            Add Product
                        </Button>
                    </div>

                    {/* Add Product Form */}
                    {showAddForm && (
                        <div className="mb-6 p-5 border border-ui-border-base rounded-xl bg-ui-bg-subtle space-y-4">
                            <Heading level="h3">Add Product to Bulk List</Heading>

                            {/* Search */}
                            <div className="space-y-1">
                                <Label>Search Product *</Label>
                                <Input
                                    placeholder="Type product name..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        setSelectedProduct(null)
                                    }}
                                />
                                {searching && (
                                    <p className="text-xs text-ui-fg-muted animate-pulse">Searching...</p>
                                )}
                                {searchResults.length > 0 && !selectedProduct && (
                                    <div className="border border-ui-border-base rounded-lg overflow-hidden bg-ui-bg-base shadow-sm">
                                        {searchResults.map((p) => (
                                            <button
                                                key={p.id}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-ui-bg-subtle text-left border-b border-ui-border-base last:border-0 transition-colors"
                                                onClick={() => {
                                                    setSelectedProduct(p)
                                                    setSearchQuery(p.title)
                                                    setSearchResults([])
                                                }}
                                            >
                                                {p.thumbnail && (
                                                    <img src={p.thumbnail} alt="" className="w-10 h-10 object-cover rounded border border-ui-border-base flex-shrink-0" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-ui-fg-base text-sm">{p.title}</p>
                                                    <p className="text-xs text-ui-fg-muted">{p.handle}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {selectedProduct && (
                                    <div className="flex items-center gap-3 p-3 bg-ui-bg-base border border-ui-border-strong rounded-lg">
                                        {selectedProduct.thumbnail && (
                                            <img src={selectedProduct.thumbnail} alt="" className="w-10 h-10 object-cover rounded border border-ui-border-base flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-ui-fg-base text-sm truncate">{selectedProduct.title}</p>
                                            <p className="text-xs text-ui-fg-muted">{selectedProduct.handle}</p>
                                        </div>
                                        <Badge color="green">Selected</Badge>
                                    </div>
                                )}
                            </div>

                            {/* Min Quantity (optional) */}
                            <div className="space-y-1">
                                <Label>Min. Order Quantity <span className="text-ui-fg-muted text-xs">(optional)</span></Label>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 50"
                                    value={minQuantity}
                                    onChange={(e) => setMinQuantity(e.target.value)}
                                />
                            </div>

                            {/* Notes (optional) */}
                            <div className="space-y-1">
                                <Label>Notes <span className="text-ui-fg-muted text-xs">(optional — internal)</span></Label>
                                <Input
                                    placeholder="e.g. Available in sizes M-XL only"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            {errorMsg && (
                                <p className="text-red-500 text-sm font-medium">{errorMsg}</p>
                            )}

                            <div className="flex gap-3 pt-1">
                                <Button
                                    variant="primary"
                                    disabled={!selectedProduct || submitting}
                                    onClick={handleAddProduct}
                                >
                                    {submitting ? "Adding..." : "Add to Bulk List"}
                                </Button>
                                <Button variant="secondary" onClick={() => { setShowAddForm(false); setErrorMsg("") }}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    {bulkProducts.length === 0 ? (
                        <div className="text-center py-16 border border-ui-border-base rounded-2xl bg-ui-bg-subtle/50">
                            <ArchiveBox className="mx-auto w-10 h-10 text-ui-fg-muted mb-4 opacity-40" />
                            <p className="text-ui-fg-subtle mb-6 font-medium">No products in the bulk list yet</p>
                            <Button onClick={() => setShowAddForm(true)} variant="secondary">
                                Add Your First Bulk Product
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Product</Table.HeaderCell>
                                    <Table.HeaderCell>Min. Qty</Table.HeaderCell>
                                    <Table.HeaderCell>Notes</Table.HeaderCell>
                                    <Table.HeaderCell>Status</Table.HeaderCell>
                                    <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {bulkProducts.map((item) => {
                                    const product = productDetails[item.product_id]
                                    return (
                                        <Table.Row key={item.id}>
                                            {/* Product info */}
                                            <Table.Cell>
                                                <div className="flex items-center gap-3">
                                                    {product?.thumbnail ? (
                                                        <img
                                                            src={product.thumbnail}
                                                            alt={product.title}
                                                            className="h-12 w-10 object-cover rounded border border-ui-border-base flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-10 bg-ui-bg-subtle rounded border border-ui-border-base flex-shrink-0" />
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-ui-fg-base text-sm truncate max-w-[220px]">
                                                            {product?.title || item.product_id}
                                                        </p>
                                                        <p className="text-xs text-ui-fg-muted font-mono truncate max-w-[220px]">
                                                            {item.product_id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Table.Cell>

                                            {/* Min qty */}
                                            <Table.Cell>
                                                {item.min_quantity ? (
                                                    <span className="font-mono text-xs bg-ui-bg-subtle px-2 py-0.5 rounded border border-ui-border-base text-ui-fg-subtle">
                                                        {item.min_quantity} units
                                                    </span>
                                                ) : (
                                                    <span className="text-ui-fg-muted italic text-xs">—</span>
                                                )}
                                            </Table.Cell>

                                            {/* Notes */}
                                            <Table.Cell>
                                                <span className="text-sm text-ui-fg-subtle truncate max-w-[180px] block">
                                                    {item.notes || <span className="italic opacity-40">—</span>}
                                                </span>
                                            </Table.Cell>

                                            {/* Status toggle */}
                                            <Table.Cell>
                                                <button onClick={() => toggleActive(item)} className="cursor-pointer">
                                                    {item.is_active ? (
                                                        <Badge color="green">Active</Badge>
                                                    ) : (
                                                        <Badge color="grey">Inactive</Badge>
                                                    )}
                                                </button>
                                            </Table.Cell>

                                            {/* Actions */}
                                            <Table.Cell className="text-right">
                                                <Button
                                                    size="small"
                                                    variant="danger"
                                                    onClick={() => deleteItem(item.id)}
                                                >
                                                    <Trash />
                                                </Button>
                                            </Table.Cell>
                                        </Table.Row>
                                    )
                                })}
                            </Table.Body>
                        </Table>
                    )}
                </Container>
            </div>

            {/* Right Column: Settings Panel */}
            <div>
                <Container className="space-y-6">
                    <div>
                        <Heading level="h2">Contact Settings</Heading>
                        <p className="text-xs text-ui-fg-muted mt-1 leading-relaxed">
                            Configure active bulk order contact channels and dynamic widget scripts for the storefront.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Phone */}
                        <div className="p-4 border border-ui-border-base rounded-xl bg-ui-bg-subtle/40 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-sm text-ui-fg-base">Phone Call Support</span>
                                <Switch
                                    checked={settings.phone_enabled}
                                    onCheckedChange={(val) => setSettings(s => ({ ...s, phone_enabled: val }))}
                                />
                            </div>
                            {settings.phone_enabled && (
                                <div className="space-y-1">
                                    <Label className="text-xs text-ui-fg-subtle">Phone Number</Label>
                                    <Input
                                        value={settings.phone_number}
                                        onChange={(e) => setSettings(s => ({ ...s, phone_number: e.target.value }))}
                                        placeholder="e.g. +8801304117711"
                                    />
                                </div>
                            )}
                        </div>

                        {/* WhatsApp */}
                        <div className="p-4 border border-ui-border-base rounded-xl bg-ui-bg-subtle/40 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-sm text-ui-fg-base">WhatsApp Support</span>
                                <Switch
                                    checked={settings.whatsapp_enabled}
                                    onCheckedChange={(val) => setSettings(s => ({ ...s, whatsapp_enabled: val }))}
                                />
                            </div>
                            {settings.whatsapp_enabled && (
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-ui-fg-subtle">WhatsApp Number (inc. Country Code)</Label>
                                        <Input
                                            value={settings.whatsapp_number}
                                            onChange={(e) => setSettings(s => ({ ...s, whatsapp_number: e.target.value }))}
                                            placeholder="e.g. 8801304117711"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-ui-fg-subtle">Pre-filled Chat Message</Label>
                                        <Input
                                            value={settings.whatsapp_message}
                                            onChange={(e) => setSettings(s => ({ ...s, whatsapp_message: e.target.value }))}
                                            placeholder="Message template..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div className="p-4 border border-ui-border-base rounded-xl bg-ui-bg-subtle/40 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-sm text-ui-fg-base">Email Support</span>
                                <Switch
                                    checked={settings.email_enabled}
                                    onCheckedChange={(val) => setSettings(s => ({ ...s, email_enabled: val }))}
                                />
                            </div>
                            {settings.email_enabled && (
                                <div className="space-y-1">
                                    <Label className="text-xs text-ui-fg-subtle">Email Address</Label>
                                    <Input
                                        type="email"
                                        value={settings.email_address}
                                        onChange={(e) => setSettings(s => ({ ...s, email_address: e.target.value }))}
                                        placeholder="e.g. info@zahan.com"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Live Chat */}
                        <div className="p-4 border border-ui-border-base rounded-xl bg-ui-bg-subtle/40 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-sm text-ui-fg-base">Live Chat Widget</span>
                                <Switch
                                    checked={settings.livechat_enabled}
                                    onCheckedChange={(val) => setSettings(s => ({ ...s, livechat_enabled: val }))}
                                />
                            </div>
                            {settings.livechat_enabled && (
                                <p className="text-xs text-ui-fg-muted mt-1 leading-relaxed">
                                    Enables the built-in, custom ZAHAN live chat bubble on the storefront. You can view messages and reply under the <strong>Customer Chat</strong> page.
                                </p>
                            )}
                        </div>

                        <Button
                            className="w-full mt-2"
                            variant="primary"
                            onClick={saveSettings}
                            disabled={savingSettings}
                        >
                            {savingSettings ? "Saving Settings..." : "Save Settings"}
                        </Button>
                    </div>
                </Container>
            </div>
            <Toaster />
        </div>
    )
}

const BulkIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
        {/* Layer boxes effect behind */}
        <path d="M16 3.13a2 2 0 0 1 2 0l3 1.73a2 2 0 0 1 1 1.73v5.48" opacity="0.5" />
        <path d="M8 3.13a2 2 0 0 0-2 0l-3 1.73a2 2 0 0 0-1 1.73v5.48" opacity="0.5" />
    </svg>
)

export const config = defineRouteConfig({
    label: "Bulk Orders",
    icon: BulkIcon,
})

export default BulkOrdersPage
