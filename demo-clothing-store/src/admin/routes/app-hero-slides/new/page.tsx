import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Label, Switch, Select } from "@medusajs/ui"
import { ArrowLeft } from "@medusajs/icons"
import { useState, useEffect } from "react"

const LINK_TYPES = [
    { value: "none",         label: "None (Decorative)",     needsValue: false, valueLabel: "",            loadKey: "" },
    { value: "shop",         label: "Shop — All Products",   needsValue: false, valueLabel: "",            loadKey: "" },
    { value: "new_arrivals", label: "Shop — New Arrivals",   needsValue: false, valueLabel: "",            loadKey: "" },
    { value: "best_selling", label: "Shop — Best Selling",   needsValue: false, valueLabel: "",            loadKey: "" },
    { value: "recommended",  label: "Recommended For You",   needsValue: false, valueLabel: "",            loadKey: "" },
    { value: "category",     label: "Category Page",         needsValue: true,  valueLabel: "Category",    loadKey: "categories" },
    { value: "collection",   label: "Collection Page",       needsValue: true,  valueLabel: "Collection",  loadKey: "collections" },
    { value: "product",      label: "Product Page",          needsValue: true,  valueLabel: "Product",     loadKey: "products" },
    { value: "search",       label: "Search Results",        needsValue: true,  valueLabel: "Search Query",loadKey: "search" },
] as const

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

const LINK_MAP = Object.fromEntries(LINK_TYPES.map((t) => [t.value, t]))

interface LiveOption { value: string; label: string }

const NewAppHeroSlidePage = () => {
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        image: "",
        link_type: "none",
        link_value: "",
        link_label: "",
        sort_order: 0,
        is_active: true,
    })
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [liveOptions, setLiveOptions] = useState<LiveOption[]>([])
    const [loadingLive, setLoadingLive] = useState(false)

    // Load live options whenever link_type changes
    useEffect(() => {
        const def = LINK_MAP[formData.link_type]
        if (!def.needsValue || def.loadKey === "search" || def.loadKey === "") {
            setLiveOptions([])
            return
        }
        setLoadingLive(true)
        ;(async () => {
            try {
                let options: LiveOption[] = []
                if (def.loadKey === "categories") {
                    const res = await fetch("/admin/product-categories?limit=200&fields=id,name,handle", { credentials: "include" })
                    const data = await res.json()
                    options = (data.product_categories || data.categories || []).map((c: any) => ({ value: c.handle, label: c.name }))
                } else if (def.loadKey === "collections") {
                    const res = await fetch("/admin/collections?limit=200&fields=id,title,handle", { credentials: "include" })
                    const data = await res.json()
                    options = (data.collections || []).map((c: any) => ({ value: c.handle, label: c.title }))
                } else if (def.loadKey === "products") {
                    const res = await fetch("/admin/products?limit=200&fields=id,title,handle&status=published", { credentials: "include" })
                    const data = await res.json()
                    options = (data.products || []).map((p: any) => ({ value: p.handle, label: p.title }))
                }
                setLiveOptions(options)
            } catch (err) {
                console.error("Failed to load live options", err)
                setLiveOptions([])
            } finally {
                setLoadingLive(false)
            }
        })()
    }, [formData.link_type])

    const handleImageUpload = async (file: File) => {
        if (file.size > 1 * 1024 * 1024) {
            alert(`❌ Image too large! Max 1 MB.\n\n"${file.name}" is ${(file.size / 1024).toFixed(0)} KB.`)
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
            setFormData((p) => ({ ...p, image: url }))
        } catch (err) {
            alert("Failed to upload image")
        } finally {
            setUploading(false)
        }
    }

    const handleLinkTypeChange = (val: string) =>
        setFormData((p) => ({ ...p, link_type: val, link_value: "", link_label: "" }))

    const handleLiveSelect = (val: string) => {
        const found = liveOptions.find((o) => o.value === val)
        setFormData((p) => ({ ...p, link_value: val, link_label: found?.label ?? val }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.image.trim()) { alert("Please add an image before saving."); return }
        setSaving(true)
        try {
            const res = await fetch("/admin/app-hero-slides", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            })
            if (res.ok) {
                alert("Slide created!")
                window.location.href = "/app/app-hero-slides"
            } else {
                const err = await res.json()
                alert(`Error: ${err.message}`)
            }
        } catch (err) {
            alert("Failed to create slide")
        } finally {
            setSaving(false)
        }
    }

    const activeDef = LINK_MAP[formData.link_type]
    const needsValue = activeDef.needsValue
    const isSearch = activeDef.loadKey === "search"

    return (
        <Container>
            <div className="mb-6">
                <Button variant="transparent" onClick={() => (window.location.href = "/app/app-hero-slides")} className="mb-4">
                    <ArrowLeft /> Back to Mobile Hero
                </Button>
                <div className="flex items-center gap-3">
                    <Heading level="h1">New Mobile Hero Slide</Heading>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                        📱 App Only
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* ── Image ─────────────────────────────────── */}
                <section>
                    <Heading level="h2" className="mb-1">Hero Image *</Heading>
                    <p className="text-sm text-ui-fg-subtle mb-4">
                        Full-width banner. Recommended: <strong>800×400 px</strong>, max 1 MB.
                        expo-image auto-caches to device disk — no manual file management needed.
                    </p>
                    <div className="flex gap-2">
                        <Input
                            value={formData.image}
                            onChange={(e) => setFormData((p) => ({ ...p, image: e.target.value }))}
                            placeholder="Paste image URL or upload →"
                            className="flex-1"
                        />
                        <Button type="button" variant="secondary" disabled={uploading}
                            onClick={() => document.getElementById("new-app-hero-upload")?.click()}>
                            {uploading ? "Uploading…" : "Upload"}
                        </Button>
                        <input id="new-app-hero-upload" type="file" accept="image/*" style={{ display: "none" }}
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }} />
                    </div>
                    {formData.image && (
                        <div className="mt-3">
                            <img src={formData.image} alt="Preview"
                                className="h-36 object-cover rounded-lg border border-ui-border-base shadow-sm"
                                style={{ aspectRatio: "2/1" }} />
                            <p className="text-xs text-ui-fg-muted mt-1">Preview — 2:1 ratio on device</p>
                        </div>
                    )}
                </section>

                {/* ── Text ──────────────────────────────────── */}
                <section className="border-t pt-6">
                    <Heading level="h2" className="mb-1">Text Overlay (Optional)</Heading>
                    <p className="text-sm text-ui-fg-subtle mb-4">Leave blank for a clean image-only slide.</p>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="new-title" className="mb-2 block">Title</Label>
                            <Input id="new-title" value={formData.title}
                                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                                placeholder="e.g. New Season Arrivals" />
                        </div>
                        <div>
                            <Label htmlFor="new-subtitle" className="mb-2 block">Subtitle / Tag</Label>
                            <Input id="new-subtitle" value={formData.subtitle}
                                onChange={(e) => setFormData((p) => ({ ...p, subtitle: e.target.value }))}
                                placeholder="e.g. 2026 COLLECTION" />
                        </div>
                    </div>
                </section>

                {/* ── Destination ───────────────────────────── */}
                <section className="border-t pt-6">
                    <Heading level="h2" className="mb-1">Tap Destination</Heading>
                    <p className="text-sm text-ui-fg-subtle mb-4">Where does the user land when they tap this banner?</p>

                    <div className="mb-4">
                        <Label className="mb-2 block">Destination Type</Label>
                        <Select value={formData.link_type} onValueChange={handleLinkTypeChange}>
                            <Select.Trigger><Select.Value placeholder="Choose destination…" /></Select.Trigger>
                            <Select.Content>
                                {LINK_TYPES.map((t) => (
                                    <Select.Item key={t.value} value={t.value}>{t.label}</Select.Item>
                                ))}
                            </Select.Content>
                        </Select>
                        {LINK_DESCRIPTIONS[formData.link_type] && (
                            <p className="text-xs text-ui-fg-muted mt-1.5">ℹ️ {LINK_DESCRIPTIONS[formData.link_type]}</p>
                        )}
                    </div>

                    {/* Live picker — category / collection / product */}
                    {needsValue && !isSearch && (
                        <div>
                            <Label className="mb-2 block">
                                {activeDef.valueLabel}
                                {loadingLive && <span className="ml-2 text-ui-fg-muted text-xs animate-pulse">Loading live data…</span>}
                            </Label>
                            {liveOptions.length > 0 ? (
                                <Select value={formData.link_value} onValueChange={handleLiveSelect}>
                                    <Select.Trigger>
                                        <Select.Value placeholder={`Select a ${activeDef.valueLabel.toLowerCase()}…`} />
                                    </Select.Trigger>
                                    <Select.Content>
                                        {liveOptions.map((o) => (
                                            <Select.Item key={o.value} value={o.value}>{o.label}</Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select>
                            ) : !loadingLive ? (
                                <div className="text-sm text-ui-fg-muted bg-ui-bg-subtle rounded-lg border border-ui-border-base px-4 py-3">
                                    {activeDef.loadKey === "categories"
                                        ? "No categories found. Create some in Products → Categories."
                                        : activeDef.loadKey === "collections"
                                        ? "No collections found. Create some in Products → Collections."
                                        : "No published products found."}
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* Search query */}
                    {needsValue && isSearch && (
                        <div>
                            <Label htmlFor="new-search" className="mb-2 block">Search Query</Label>
                            <Input id="new-search" value={formData.link_value}
                                onChange={(e) => setFormData((p) => ({ ...p, link_value: e.target.value, link_label: e.target.value }))}
                                placeholder="e.g. summer dress" />
                            <p className="text-xs text-ui-fg-muted mt-1">App will open with this term pre-searched.</p>
                        </div>
                    )}
                </section>

                {/* ── Display ───────────────────────────────── */}
                <section className="border-t pt-6">
                    <Heading level="h2" className="mb-4">Display Settings</Heading>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="new-order" className="mb-2 block">Sort Order</Label>
                            <Input id="new-order" type="number" value={formData.sort_order}
                                onChange={(e) => setFormData((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                                placeholder="0" />
                            <p className="text-xs text-ui-fg-muted mt-1">Lower = appears first</p>
                        </div>
                        <div className="flex items-center gap-3 mt-6">
                            <Switch id="new-active" checked={formData.is_active}
                                onCheckedChange={(v) => setFormData((p) => ({ ...p, is_active: v }))} />
                            <Label htmlFor="new-active">Active (visible in the app)</Label>
                        </div>
                    </div>
                </section>

                {/* ── Actions ───────────────────────────────── */}
                <div className="flex gap-3 pt-4 border-t">
                    <Button type="submit" variant="primary" disabled={saving || uploading}>
                        {saving ? "Creating…" : "Create Slide"}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => (window.location.href = "/app/app-hero-slides")}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Container>
    )
}

export const config = defineRouteConfig({ label: "New Mobile Hero Slide" })
export default NewAppHeroSlidePage
