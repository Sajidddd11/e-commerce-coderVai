import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Label, Switch, Select } from "@medusajs/ui"
import { ArrowLeft } from "@medusajs/icons"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

// ─── Link type definitions ────────────────────────────────────────────────────

const LINK_TYPES = [
    { value: "none",         label: "None (Decorative)",          needsValue: false, valueLabel: null },
    { value: "shop",         label: "Shop — All Products",        needsValue: false, valueLabel: null },
    { value: "new_arrivals", label: "Shop — New Arrivals",        needsValue: false, valueLabel: null },
    { value: "best_selling", label: "Shop — Best Selling",        needsValue: false, valueLabel: null },
    { value: "recommended",  label: "Recommended For You",        needsValue: false, valueLabel: null },
    { value: "category",     label: "Category Page",              needsValue: true,  valueLabel: "Category", loadKey: "categories" },
    { value: "collection",   label: "Collection Page",            needsValue: true,  valueLabel: "Collection", loadKey: "collections" },
    { value: "product",      label: "Product Page",               needsValue: true,  valueLabel: "Product", loadKey: "products" },
    { value: "search",       label: "Search Results",             needsValue: true,  valueLabel: "Search Query", loadKey: "search" },
] as const

const LINK_TYPES_MAP = Object.fromEntries(LINK_TYPES.map((t) => [t.value, t]))

// ─── Description helper ───────────────────────────────────────────────────────

const LINK_DESCRIPTIONS: Record<string, string> = {
    none: "This slide has no tap destination. Good for brand awareness banners.",
    shop: "Opens the main shop screen showing all products.",
    new_arrivals: "Opens the shop screen sorted by newest arrivals.",
    best_selling: "Opens the shop screen sorted by best-selling products.",
    recommended: "Opens the shop screen filtered to personalised recommendations.",
    category: "Opens the shop screen pre-filtered to the selected category.",
    collection: "Opens the shop screen pre-filtered to the selected collection.",
    product: "Goes directly to the selected product's detail page.",
    search: "Opens shop with a pre-filled search query.",
}

// ─── Form component ───────────────────────────────────────────────────────────

interface FormData {
    title: string
    subtitle: string
    image: string
    link_type: string
    link_value: string
    link_label: string
    sort_order: number
    is_active: boolean
}

interface LiveOption { value: string; label: string }

interface AppHeroSlideFormProps {
    mode: "new" | "edit"
    id?: string
}

const AppHeroSlideForm = ({ mode, id }: AppHeroSlideFormProps) => {
    const [formData, setFormData] = useState<FormData>({
        title: "",
        subtitle: "",
        image: "",
        link_type: "none",
        link_value: "",
        link_label: "",
        sort_order: 0,
        is_active: true,
    })

    const [loading, setLoading] = useState(mode === "edit")
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    // Live data for pickers
    const [liveOptions, setLiveOptions] = useState<LiveOption[]>([])
    const [loadingLive, setLoadingLive] = useState(false)

    // ── Fetch existing slide (edit mode) ────────────────────────────────────
    useEffect(() => {
        if (mode !== "edit" || !id) return
        ;(async () => {
            try {
                const res = await fetch(`/admin/app-hero-slides/${id}`, { credentials: "include" })
                const data = await res.json()
                if (data.slide) {
                    const s = data.slide
                    setFormData({
                        title: s.title || "",
                        subtitle: s.subtitle || "",
                        image: s.image || "",
                        link_type: s.link_type || "none",
                        link_value: s.link_value || "",
                        link_label: s.link_label || "",
                        sort_order: s.sort_order ?? 0,
                        is_active: s.is_active ?? true,
                    })
                }
            } catch (err) {
                console.error("Failed to load slide", err)
                alert("Failed to load hero slide")
            } finally {
                setLoading(false)
            }
        })()
    }, [mode, id])

    // ── Load live data when link_type changes ───────────────────────────────
    useEffect(() => {
        const def = LINK_TYPES_MAP[formData.link_type]
        if (!def || !("loadKey" in def) || def.loadKey === "search") {
            setLiveOptions([])
            return
        }

        setLoadingLive(true)
        ;(async () => {
            try {
                if (def.loadKey === "categories") {
                    const res = await fetch("/admin/product-categories?limit=200&fields=id,name,handle", {
                        credentials: "include",
                    })
                    const data = await res.json()
                    const cats = data.product_categories || data.categories || []
                    setLiveOptions(cats.map((c: any) => ({ value: c.handle, label: c.name })))
                } else if (def.loadKey === "collections") {
                    const res = await fetch("/admin/collections?limit=200&fields=id,title,handle", {
                        credentials: "include",
                    })
                    const data = await res.json()
                    const cols = data.collections || []
                    setLiveOptions(cols.map((c: any) => ({ value: c.handle, label: c.title })))
                } else if (def.loadKey === "products") {
                    const res = await fetch("/admin/products?limit=200&fields=id,title,handle&status=published", {
                        credentials: "include",
                    })
                    const data = await res.json()
                    const prods = data.products || []
                    setLiveOptions(prods.map((p: any) => ({ value: p.handle, label: p.title })))
                }
            } catch (err) {
                console.error("Failed to load live options", err)
                setLiveOptions([])
            } finally {
                setLoadingLive(false)
            }
        })()
    }, [formData.link_type])

    // ── Image upload ────────────────────────────────────────────────────────
    const handleImageUpload = async (file: File) => {
        const MAX = 1 * 1024 * 1024 // 1 MB
        if (file.size > MAX) {
            alert(`❌ Image too large!\n\n"${file.name}" is ${(file.size / 1024).toFixed(0)} KB.\nMaximum allowed: 1 MB.\n\nCompress it and try again.`)
            return
        }
        setUploading(true)
        try {
            const fd = new FormData()
            fd.append("files", file)
            const res = await fetch("/admin/uploads", { method: "POST", credentials: "include", body: fd })
            if (!res.ok) throw new Error("Upload failed")
            const data = await res.json()
            const url = data.files?.[0]?.url
            if (!url) throw new Error("No URL returned")
            setFormData((prev) => ({ ...prev, image: url }))
        } catch (err) {
            console.error("Upload error:", err)
            alert("Failed to upload image")
        } finally {
            setUploading(false)
        }
    }

    // ── Link type change ────────────────────────────────────────────────────
    const handleLinkTypeChange = (newType: string) => {
        setFormData((prev) => ({
            ...prev,
            link_type: newType,
            link_value: "",
            link_label: "",
        }))
    }

    // ── Live option selected ────────────────────────────────────────────────
    const handleLiveOptionSelect = (value: string) => {
        const found = liveOptions.find((o) => o.value === value)
        setFormData((prev) => ({
            ...prev,
            link_value: value,
            link_label: found?.label ?? value,
        }))
    }

    // ── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.image.trim()) {
            alert("Please add an image before saving.")
            return
        }
        setSaving(true)
        try {
            const url = mode === "new" ? "/admin/app-hero-slides" : `/admin/app-hero-slides/${id}`
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            })
            if (res.ok) {
                alert(mode === "new" ? "Slide created!" : "Slide updated!")
                window.location.href = "/app/app-hero-slides"
            } else {
                const err = await res.json()
                alert(`Error: ${err.message}`)
            }
        } catch (err) {
            console.error("Save error:", err)
            alert("Failed to save slide")
        } finally {
            setSaving(false)
        }
    }

    // ── Delete (edit mode only) ─────────────────────────────────────────────
    const handleDelete = async () => {
        if (!confirm("Delete this slide? This cannot be undone.")) return
        try {
            const res = await fetch(`/admin/app-hero-slides/${id}`, {
                method: "DELETE",
                credentials: "include",
            })
            if (res.ok) {
                alert("Slide deleted.")
                window.location.href = "/app/app-hero-slides"
            } else {
                alert("Failed to delete slide")
            }
        } catch (err) {
            console.error("Delete error:", err)
            alert("Failed to delete slide")
        }
    }

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center h-64">
                    <p className="text-ui-fg-muted animate-pulse">Loading...</p>
                </div>
            </Container>
        )
    }

    const activeDef = LINK_TYPES_MAP[formData.link_type]
    const needsValue = activeDef && "needsValue" in activeDef && activeDef.needsValue
    const loadKey = activeDef && "loadKey" in activeDef ? activeDef.loadKey : null
    const isSearchType = loadKey === "search"

    return (
        <Container>
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="transparent"
                    onClick={() => (window.location.href = "/app/app-hero-slides")}
                    className="mb-4"
                >
                    <ArrowLeft />
                    Back to Mobile Hero
                </Button>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Heading level="h1">{mode === "new" ? "New Mobile Hero Slide" : "Edit Mobile Hero Slide"}</Heading>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                            📱 App Only
                        </span>
                    </div>
                    {mode === "edit" && (
                        <Button variant="danger" onClick={handleDelete}>
                            Delete Slide
                        </Button>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* ── Image ─────────────────────────────────────────────── */}
                <section>
                    <Heading level="h2" className="mb-1">Hero Image *</Heading>
                    <p className="text-sm text-ui-fg-subtle mb-4">
                        Displayed as a full-width banner on the mobile home screen. Recommended: 800×400 px, max 1 MB.
                        <br />
                        Use <strong>expo-image</strong>'s disk cache — the image itself is cached on device automatically.
                    </p>
                    <div className="flex gap-2">
                        <Input
                            value={formData.image}
                            onChange={(e) => setFormData((p) => ({ ...p, image: e.target.value }))}
                            placeholder="Image URL or upload below"
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={uploading}
                            onClick={() => document.getElementById("app-hero-img-upload")?.click()}
                        >
                            {uploading ? "Uploading…" : "Upload"}
                        </Button>
                        <input
                            id="app-hero-img-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }}
                        />
                    </div>
                    {formData.image && (
                        <div className="mt-3">
                            <img
                                src={formData.image}
                                alt="Preview"
                                className="h-36 w-auto object-cover rounded-lg border border-ui-border-base shadow-sm"
                                style={{ aspectRatio: "2/1", objectFit: "cover" }}
                            />
                            <p className="text-xs text-ui-fg-muted mt-1">Preview — rendered at 2:1 ratio on device</p>
                        </div>
                    )}
                </section>

                {/* ── Text Content ───────────────────────────────────────── */}
                <section className="border-t pt-6">
                    <Heading level="h2" className="mb-1">Text (Optional)</Heading>
                    <p className="text-sm text-ui-fg-subtle mb-4">
                        Displayed as an overlay on the banner image. Leave blank for image-only slides.
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label htmlFor="title" className="mb-2 block">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                                placeholder="e.g. New Season Arrivals"
                            />
                        </div>
                        <div>
                            <Label htmlFor="subtitle" className="mb-2 block">Subtitle / Tag</Label>
                            <Input
                                id="subtitle"
                                value={formData.subtitle}
                                onChange={(e) => setFormData((p) => ({ ...p, subtitle: e.target.value }))}
                                placeholder="e.g. 2026 COLLECTION"
                            />
                        </div>
                    </div>
                </section>

                {/* ── Link / Destination ────────────────────────────────── */}
                <section className="border-t pt-6">
                    <Heading level="h2" className="mb-1">Tap Destination</Heading>
                    <p className="text-sm text-ui-fg-subtle mb-4">
                        Where should the user land when they tap this slide?
                    </p>

                    {/* Link type picker */}
                    <div className="mb-4">
                        <Label className="mb-2 block">Destination Type</Label>
                        <Select value={formData.link_type} onValueChange={handleLinkTypeChange}>
                            <Select.Trigger>
                                <Select.Value placeholder="Choose destination…" />
                            </Select.Trigger>
                            <Select.Content>
                                {LINK_TYPES.map((t) => (
                                    <Select.Item key={t.value} value={t.value}>
                                        {t.label}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select>
                        {LINK_DESCRIPTIONS[formData.link_type] && (
                            <p className="text-xs text-ui-fg-muted mt-1.5">
                                ℹ️ {LINK_DESCRIPTIONS[formData.link_type]}
                            </p>
                        )}
                    </div>

                    {/* Live data picker — for category/collection/product */}
                    {needsValue && !isSearchType && (
                        <div>
                            <Label className="mb-2 block">
                                {activeDef && "valueLabel" in activeDef ? activeDef.valueLabel : "Value"}
                                {loadingLive && (
                                    <span className="ml-2 text-ui-fg-muted text-xs animate-pulse">Loading…</span>
                                )}
                            </Label>
                            {liveOptions.length > 0 ? (
                                <Select
                                    value={formData.link_value}
                                    onValueChange={handleLiveOptionSelect}
                                >
                                    <Select.Trigger>
                                        <Select.Value
                                            placeholder={`Select a ${activeDef && "valueLabel" in activeDef ? (activeDef.valueLabel as string).toLowerCase() : "value"}…`}
                                        />
                                    </Select.Trigger>
                                    <Select.Content>
                                        {liveOptions.map((o) => (
                                            <Select.Item key={o.value} value={o.value}>
                                                {o.label}
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select>
                            ) : !loadingLive ? (
                                <div className="text-sm text-ui-fg-muted bg-ui-bg-subtle rounded-lg border border-ui-border-base px-4 py-3">
                                    {formData.link_type === "category"
                                        ? "No categories found. Create some in Products → Categories."
                                        : formData.link_type === "collection"
                                        ? "No collections found. Create some in Products → Collections."
                                        : "No published products found."}
                                </div>
                            ) : null}

                            {/* Fallback manual entry if list loaded but current value not in it */}
                            {formData.link_value && !liveOptions.find((o) => o.value === formData.link_value) && (
                                <div className="mt-2">
                                    <p className="text-xs text-ui-fg-muted mb-1">Or enter a handle manually:</p>
                                    <Input
                                        value={formData.link_value}
                                        onChange={(e) =>
                                            setFormData((p) => ({ ...p, link_value: e.target.value, link_label: e.target.value }))
                                        }
                                        placeholder={`${activeDef && "valueLabel" in activeDef ? activeDef.valueLabel : "handle"}...`}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Search query input */}
                    {needsValue && isSearchType && (
                        <div>
                            <Label htmlFor="search_query" className="mb-2 block">Search Query</Label>
                            <Input
                                id="search_query"
                                value={formData.link_value}
                                onChange={(e) =>
                                    setFormData((p) => ({ ...p, link_value: e.target.value, link_label: e.target.value }))
                                }
                                placeholder="e.g. summer dress"
                            />
                            <p className="text-xs text-ui-fg-muted mt-1">
                                The app shop screen will open pre-filtered with this search term.
                            </p>
                        </div>
                    )}
                </section>

                {/* ── Display Settings ──────────────────────────────────── */}
                <section className="border-t pt-6">
                    <Heading level="h2" className="mb-4">Display Settings</Heading>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="sort_order" className="mb-2 block">Sort Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                value={formData.sort_order}
                                onChange={(e) =>
                                    setFormData((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))
                                }
                                placeholder="0"
                            />
                            <p className="text-xs text-ui-fg-muted mt-1">Lower = appears first in the carousel</p>
                        </div>
                        <div className="flex items-center gap-3 mt-6">
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_active: checked }))}
                            />
                            <Label htmlFor="is_active">Active (visible in the app)</Label>
                        </div>
                    </div>
                </section>

                {/* ── Actions ───────────────────────────────────────────── */}
                <div className="flex gap-3 pt-4 border-t">
                    <Button type="submit" variant="primary" disabled={saving || uploading}>
                        {saving ? "Saving…" : mode === "new" ? "Create Slide" : "Save Changes"}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => (window.location.href = "/app/app-hero-slides")}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Container>
    )
}

// ─── Edit page ────────────────────────────────────────────────────────────────

const EditAppHeroSlidePage = () => {
    const { id } = useParams()
    return <AppHeroSlideForm mode="edit" id={id} />
}

export const config = defineRouteConfig({ label: "Edit Mobile Hero Slide" })
export default EditAppHeroSlidePage
