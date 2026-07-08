import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Textarea, Label, Switch, Select } from "@medusajs/ui"
import { ArrowLeft, Trash } from "@medusajs/icons"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

const SLIDE_TYPES = [
    { value: "side_image_left", label: "Side Image (Image Left, Text Right)" },
    { value: "side_image_right", label: "Side Image (Text Left, Image Right)" },
    { value: "center_text", label: "Center Text with Background" },
    { value: "video", label: "Video Background" },
    { value: "static_image", label: "Static Image (Full Width)" },
]

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

const EditHeroSlidePage = () => {
    const { id } = useParams()
    
    // Parse platform query param (e.g. ?platform=web or ?platform=app)
    const searchParams = new URLSearchParams(window.location.search)
    const platform = searchParams.get("platform") || "web"
    const isWebPlatform = platform === "web"

    const [formData, setFormData] = useState({
        // Shared fields
        title: "",
        sort_order: 0,
        is_active: true,

        // Web fields
        slide_type: "side_image_left",
        description: "",
        button_text: "",
        button_link: "",
        background_image: "",
        side_image: "",
        video_url: "",
        overlay_color: "",

        // App fields
        subtitle: "",
        image: "",
        link_type: "none",
        link_value: "",
        link_label: "",
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingBg, setUploadingBg] = useState(false)
    const [uploadingSide, setUploadingSide] = useState(false)
    const [uploadingVideo, setUploadingVideo] = useState(false)
    const [uploadingAppImage, setUploadingAppImage] = useState(false)

    const [liveOptions, setLiveOptions] = useState<LiveOption[]>([])
    const [loadingLive, setLoadingLive] = useState(false)

    useEffect(() => {
        fetchSlide()
    }, [id])

    // Load live options for App Link Value picker
    useEffect(() => {
        if (isWebPlatform) return

        const def = LINK_MAP[formData.link_type]
        if (!def || !def.needsValue || def.loadKey === "search" || def.loadKey === "") {
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
    }, [formData.link_type, isWebPlatform])

    const fetchSlide = async () => {
        try {
            const endpoint = isWebPlatform ? `/admin/hero-slides/${id}` : `/admin/app-hero-slides/${id}`
            const response = await fetch(endpoint, {
                credentials: "include",
            })
            const data = await response.json()
            if (data.slide) {
                if (isWebPlatform) {
                    setFormData((prev) => ({
                        ...prev,
                        title: data.slide.title || "",
                        sort_order: data.slide.sort_order ?? 0,
                        is_active: data.slide.is_active ?? true,
                        slide_type: data.slide.slide_type || "side_image_left",
                        description: data.slide.description || "",
                        button_text: data.slide.button_text || "",
                        button_link: data.slide.button_link || "",
                        background_image: data.slide.background_image || "",
                        side_image: data.slide.side_image || "",
                        video_url: data.slide.video_url || "",
                        overlay_color: data.slide.overlay_color || "",
                    }))
                } else {
                    setFormData((prev) => ({
                        ...prev,
                        title: data.slide.title || "",
                        sort_order: data.slide.sort_order ?? 0,
                        is_active: data.slide.is_active ?? true,
                        subtitle: data.slide.subtitle || "",
                        image: data.slide.image || "",
                        link_type: data.slide.link_type || "none",
                        link_value: data.slide.link_value || "",
                        link_label: data.slide.link_label || "",
                    }))
                }
            }
        } catch (error) {
            console.error("Error fetching slide:", error)
            alert("Failed to load hero slide")
        } finally {
            setLoading(false)
        }
    }

    const MAX_IMAGE_SIZE = 1 * 1024 * 1024 // 1 MB
    const MAX_VIDEO_SIZE = 10 * 1024 * 1024 // 10 MB

    const handleFileUpload = async (
        file: File,
        field: "background_image" | "side_image" | "video_url" | "image",
        setUploading: (v: boolean) => void
    ) => {
        const isVideo = field === "video_url"
        const limit = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
        const limitLabel = isVideo ? "10 MB" : "1 MB"
        if (file.size > limit) {
            alert(`❌ File too large!\n\n"${file.name}" is ${(file.size / 1024).toFixed(1)} KB.\nMaximum allowed size is ${limitLabel}.`)
            return
        }

        setUploading(true)
        try {
            const fd = new FormData()
            fd.append("files", file)

            const response = await fetch("/admin/uploads", {
                method: "POST",
                credentials: "include",
                body: fd,
            })

            if (!response.ok) throw new Error("Upload failed")

            const data = await response.json()
            const uploadedUrl = data.files?.[0]?.url
            if (!uploadedUrl) throw new Error("No URL returned from upload")

            setFormData((prev) => ({ ...prev, [field]: uploadedUrl }))
        } catch (error) {
            console.error("Upload error:", error)
            alert("Failed to upload file")
        } finally {
            setUploading(false)
        }
    }

    const handleLinkTypeChange = (val: string) => {
        setFormData((p) => ({ ...p, link_type: val, link_value: "", link_label: "" }))
    }

    const handleLiveSelect = (val: string) => {
        const found = liveOptions.find((o) => o.value === val)
        setFormData((p) => ({ ...p, link_value: val, link_label: found?.label ?? val }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isWebPlatform) {
            if (formData.slide_type === "video" && !formData.video_url) {
                alert("❌ Please upload a background video for the web storefront banner.")
                return
            }
            if (formData.slide_type !== "video" && !formData.background_image) {
                alert("❌ Please upload a background image for the web storefront banner.")
                return
            }
        } else {
            if (!formData.image.trim()) {
                alert("❌ Please upload a mobile hero image for the app banner.")
                return
            }
        }

        setSaving(true)

        try {
            const endpoint = isWebPlatform ? `/admin/hero-slides/${id}` : `/admin/app-hero-slides/${id}`
            const payload = isWebPlatform
                ? {
                      slide_type: formData.slide_type,
                      title: formData.title,
                      description: formData.description,
                      button_text: formData.button_text,
                      button_link: formData.button_link,
                      background_image: formData.background_image,
                      side_image: formData.side_image,
                      video_url: formData.video_url,
                      overlay_color: formData.overlay_color,
                      sort_order: formData.sort_order,
                      is_active: formData.is_active,
                  }
                : {
                      title: formData.title,
                      subtitle: formData.subtitle,
                      image: formData.image,
                      link_type: formData.link_type,
                      link_value: formData.link_value,
                      link_label: formData.link_label,
                      sort_order: formData.sort_order,
                      is_active: formData.is_active,
                  }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                alert("Hero slide updated successfully!")
                window.location.href = "/app/hero-slides"
            } else {
                const error = await response.json()
                alert(`Error: ${error.message}`)
            }
        } catch (error) {
            console.error("Error updating slide:", error)
            alert("Failed to update hero slide")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete this ${isWebPlatform ? "web" : "mobile app"} hero slide? This cannot be undone.`))
            return

        try {
            const endpoint = isWebPlatform ? `/admin/hero-slides/${id}` : `/admin/app-hero-slides/${id}`
            const response = await fetch(endpoint, {
                method: "DELETE",
                credentials: "include",
            })

            if (response.ok) {
                alert("Hero slide deleted!")
                window.location.href = "/app/hero-slides"
            } else {
                alert("Failed to delete slide")
            }
        } catch (error) {
            console.error("Error deleting slide:", error)
            alert("Failed to delete slide")
        }
    }

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center h-64 bg-ui-bg-subtle rounded-xl border border-ui-border-base">
                    <p className="text-ui-fg-muted font-medium animate-pulse">Loading...</p>
                </div>
            </Container>
        )
    }

    const showTextField = formData.slide_type !== "static_image"
    const showSideImage =
        formData.slide_type === "side_image_left" || formData.slide_type === "side_image_right"
    const showBackgroundImage = formData.slide_type !== "video"
    const showVideo = formData.slide_type === "video"
    const showButton = formData.slide_type !== "static_image"
    const showOverlay = formData.slide_type === "video" || formData.slide_type === "center_text"

    const activeAppDef = LINK_MAP[formData.link_type]
    const appNeedsValue = activeAppDef?.needsValue
    const appIsSearch = activeAppDef?.loadKey === "search"

    return (
        <Container>
            <div className="mb-6">
                <Button
                    variant="transparent"
                    onClick={() => (window.location.href = "/app/hero-slides")}
                    className="mb-4"
                >
                    <ArrowLeft />
                    Back to Hero Banners
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <Heading level="h1">Edit Hero Slide</Heading>
                        <p className="text-sm text-ui-fg-subtle mt-1">
                            Editing the slide configured for {isWebPlatform ? "💻 Web Storefront" : "📱 Mobile App"}.
                        </p>
                    </div>
                    <Button variant="danger" onClick={handleDelete}>
                        <Trash />
                        Delete Slide
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General/Shared Options */}
                <section className="bg-ui-bg-base p-6 rounded-2xl border border-ui-border-base space-y-4">
                    <Heading level="h2">General Settings</Heading>
                    <div>
                        <Label htmlFor="title" className="mb-2 block">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, title: e.target.value }))
                            }
                            placeholder="e.g. New Arrivals"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="sort_order" className="mb-2 block">
                                Sort Order
                            </Label>
                            <Input
                                id="sort_order"
                                type="number"
                                value={formData.sort_order}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        sort_order: parseInt(e.target.value) || 0,
                                    }))
                                }
                                placeholder="0"
                            />
                            <p className="text-xs text-ui-fg-subtle mt-1">Lower numbers appear first</p>
                        </div>
                        <div className="flex items-end pb-1">
                            <div className="flex items-center gap-3">
                                <Switch
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({ ...prev, is_active: checked }))
                                    }
                                />
                                <Label htmlFor="is_active">Active (Visible to users)</Label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Web Options Section */}
                {isWebPlatform ? (
                    <section className="bg-ui-bg-base p-6 rounded-2xl border border-ui-border-base space-y-6">
                        <Heading level="h2">💻 Web Storefront Configuration</Heading>

                        {/* Slide Type */}
                        <div>
                            <Label htmlFor="slide_type" className="mb-2 block">
                                Slide Type *
                            </Label>
                            <Select
                                value={formData.slide_type}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({ ...prev, slide_type: value }))
                                }
                            >
                                <Select.Trigger>
                                    <Select.Value placeholder="Select a slide type" />
                                </Select.Trigger>
                                <Select.Content>
                                    {SLIDE_TYPES.map((type) => (
                                        <Select.Item key={type.value} value={type.value}>
                                            {type.label}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select>
                        </div>

                        {/* Description */}
                        {showTextField && (
                            <div>
                                <Label htmlFor="description" className="mb-2 block">
                                    Web Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="A short description shown below the title on web"
                                    rows={3}
                                />
                            </div>
                        )}

                        {/* Button Link / Text */}
                        {showButton && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="button_text" className="mb-2 block">
                                        Button Text
                                    </Label>
                                    <Input
                                        id="button_text"
                                        value={formData.button_text}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                button_text: e.target.value,
                                            }))
                                        }
                                        placeholder="e.g. SHOP NOW"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="button_link" className="mb-2 block">
                                        Button Link
                                    </Label>
                                    <Input
                                        id="button_link"
                                        value={formData.button_link}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                button_link: e.target.value,
                                            }))
                                        }
                                        placeholder="e.g. /collections/summer"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Static Image Destination Link */}
                        {!showButton && (
                            <div>
                                <Label htmlFor="button_link" className="mb-2 block">
                                    Click Destination Link
                                </Label>
                                <Input
                                    id="button_link"
                                    value={formData.button_link}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            button_link: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. /store"
                                />
                            </div>
                        )}

                        {/* Background Image */}
                        {showBackgroundImage && (
                            <div>
                                <Label className="mb-1 block font-medium">Background Image *</Label>
                                <p className="text-xs text-ui-fg-subtle mb-3">Recommended size: <strong>1920×800 px</strong>, max 1 MB.</p>
                                <div className="flex gap-2">
                                    <Input
                                        id="background_image"
                                        value={formData.background_image}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                background_image: e.target.value,
                                            }))
                                        }
                                        placeholder="Image URL or upload →"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        disabled={uploadingBg}
                                        onClick={() =>
                                            document.getElementById("bg-upload-edit")?.click()
                                        }
                                    >
                                        {uploadingBg ? "Uploading..." : "Upload"}
                                    </Button>
                                    <input
                                        id="bg-upload-edit"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file)
                                                handleFileUpload(file, "background_image", setUploadingBg)
                                        }}
                                    />
                                </div>
                                {formData.background_image && (
                                    <div className="mt-3">
                                        <img
                                            src={formData.background_image}
                                            alt="Background Preview"
                                            className="h-32 object-cover rounded-lg border border-ui-border-base shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Side Image */}
                        {showSideImage && (
                            <div>
                                <Label className="mb-1 block font-medium">Side Image (Product/Bottle)</Label>
                                <p className="text-xs text-ui-fg-subtle mb-3">Transparent background PNG works best here.</p>
                                <div className="flex gap-2">
                                    <Input
                                        id="side_image"
                                        value={formData.side_image}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                side_image: e.target.value,
                                            }))
                                        }
                                        placeholder="Side image URL or upload →"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        disabled={uploadingSide}
                                        onClick={() =>
                                            document.getElementById("side-upload-edit")?.click()
                                        }
                                    >
                                        {uploadingSide ? "Uploading..." : "Upload"}
                                    </Button>
                                    <input
                                        id="side-upload-edit"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file)
                                                handleFileUpload(file, "side_image", setUploadingSide)
                                        }}
                                    />
                                </div>
                                {formData.side_image && (
                                    <div className="mt-3">
                                        <img
                                            src={formData.side_image}
                                            alt="Side Preview"
                                            className="h-32 object-contain bg-ui-bg-subtle rounded-lg border border-ui-border-base"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Video */}
                        {showVideo && (
                            <div>
                                <Label className="mb-1 block font-medium">Video URL *</Label>
                                <p className="text-xs text-ui-fg-subtle mb-3">Upload an MP4 or WebM video.</p>
                                <div className="flex gap-2">
                                    <Input
                                        id="video_url"
                                        value={formData.video_url}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                video_url: e.target.value,
                                            }))
                                        }
                                        placeholder="Video URL or upload →"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        disabled={uploadingVideo}
                                        onClick={() =>
                                            document.getElementById("video-upload-edit")?.click()
                                        }
                                    >
                                        {uploadingVideo ? "Uploading..." : "Upload"}
                                    </Button>
                                    <input
                                        id="video-upload-edit"
                                        type="file"
                                        accept="video/mp4,video/webm"
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file)
                                                handleFileUpload(file, "video_url", setUploadingVideo)
                                        }}
                                    />
                                </div>
                                {formData.video_url && (
                                    <div className="mt-3">
                                        <video
                                            src={formData.video_url}
                                            className="h-32 rounded-lg border border-ui-border-base"
                                            muted
                                            loop
                                            controls
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Overlay Color */}
                        {showOverlay && (
                            <div>
                                <Label htmlFor="overlay_color" className="mb-2 block">
                                    Overlay Color (CSS color or gradient)
                                </Label>
                                <Input
                                    id="overlay_color"
                                    value={formData.overlay_color}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            overlay_color: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. rgba(0, 0, 0, 0.45) or linear-gradient(135deg, #1e293b, #0f172a)"
                                />
                            </div>
                        )}
                    </section>
                ) : (
                    /* App Options Section */
                    <section className="bg-ui-bg-base p-6 rounded-2xl border border-ui-border-base space-y-6">
                        <Heading level="h2">📱 Mobile App Configuration</Heading>

                        {/* Subtitle */}
                        <div>
                            <Label htmlFor="subtitle" className="mb-2 block">
                                App Subtitle / Tagline
                            </Label>
                            <Input
                                id="subtitle"
                                value={formData.subtitle}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                                }
                                placeholder="e.g. 2026 EXCLUSIVE COLLECTION"
                            />
                        </div>

                        {/* App Image */}
                        <div>
                            <Label className="mb-1 block font-medium">Mobile Hero Image *</Label>
                            <p className="text-xs text-ui-fg-subtle mb-3">Recommended size: <strong>800×400 px</strong> (2:1 aspect ratio), max 1 MB.</p>
                            <div className="flex gap-2">
                                <Input
                                    id="app_image"
                                    value={formData.image}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, image: e.target.value }))
                                    }
                                    placeholder="Image URL or upload →"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={uploadingAppImage}
                                    onClick={() =>
                                        document.getElementById("app-image-upload-edit")?.click()
                                    }
                                >
                                    {uploadingAppImage ? "Uploading..." : "Upload"}
                                </Button>
                                <input
                                    id="app-image-upload-edit"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file)
                                            handleFileUpload(file, "image", setUploadingAppImage)
                                    }}
                                />
                            </div>
                            {formData.image && (
                                <div className="mt-3">
                                    <img
                                        src={formData.image}
                                        alt="App Preview"
                                        className="h-32 object-cover rounded-lg border border-ui-border-base shadow-sm"
                                        style={{ aspectRatio: "2/1" }}
                                    />
                                    <p className="text-xs text-ui-fg-muted mt-1">Mobile device display preview ratio</p>
                                </div>
                            )}
                        </div>

                        {/* Tap Destination link type */}
                        <div>
                            <Label className="mb-2 block">Tap Destination</Label>
                            <Select value={formData.link_type} onValueChange={handleLinkTypeChange}>
                                <Select.Trigger><Select.Value placeholder="Choose destination…" /></Select.Trigger>
                                <Select.Content>
                                    {LINK_TYPES.map((t) => (
                                        <Select.Item key={t.value} value={t.value}>{t.label}</Select.Item>
                                    ))}
                                </Select.Content>
                            </Select>
                            {LINK_DESCRIPTIONS[formData.link_type] && (
                                <p className="text-xs text-ui-fg-subtle mt-1.5 font-medium">ℹ️ {LINK_DESCRIPTIONS[formData.link_type]}</p>
                            )}
                        </div>

                        {/* Live Picker option */}
                        {appNeedsValue && formData.link_type !== "search" && (
                            <div>
                                <Label className="mb-2 block">
                                    {activeAppDef?.valueLabel}
                                    {loadingLive && <span className="ml-2 text-ui-fg-muted text-xs animate-pulse">Loading live options…</span>}
                                </Label>
                                {liveOptions.length > 0 ? (
                                    <Select value={formData.link_value} onValueChange={handleLiveSelect}>
                                        <Select.Trigger>
                                            <Select.Value placeholder={`Select a ${activeAppDef?.valueLabel.toLowerCase()}…`} />
                                        </Select.Trigger>
                                        <Select.Content>
                                            {liveOptions.map((o) => (
                                                <Select.Item key={o.value} value={o.value}>{o.label}</Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select>
                                ) : !loadingLive ? (
                                    <div className="text-sm text-ui-fg-subtle bg-ui-bg-subtle rounded-lg border border-ui-border-base px-4 py-3">
                                        No active {activeAppDef?.loadKey} found in Medusa.
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* Search value */}
                        {appNeedsValue && formData.link_type === "search" && (
                            <div>
                                <Label htmlFor="search-val" className="mb-2 block">Search Query</Label>
                                <Input
                                    id="search-val"
                                    value={formData.link_value}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            link_value: e.target.value,
                                            link_label: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. sneakers"
                                />
                            </div>
                        )}
                    </section>
                )}

                {/* Submit / Cancel Actions */}
                <div className="flex gap-3 pt-6 border-t">
                    <Button type="submit" variant="primary" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => (window.location.href = "/app/hero-slides")}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Edit Hero Slide",
})

export default EditHeroSlidePage
