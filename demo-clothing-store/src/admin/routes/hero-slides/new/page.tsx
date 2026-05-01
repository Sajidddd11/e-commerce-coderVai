import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Textarea, Label, Switch, Select } from "@medusajs/ui"
import { ArrowLeft } from "@medusajs/icons"
import { useState } from "react"

const SLIDE_TYPES = [
    { value: "side_image_left", label: "Side Image (Image Left, Text Right)" },
    { value: "side_image_right", label: "Side Image (Text Left, Image Right)" },
    { value: "center_text", label: "Center Text with Background" },
    { value: "video", label: "Video Background" },
    { value: "static_image", label: "Static Image (Full Width)" },
]

const NewHeroSlidePage = () => {
    const [formData, setFormData] = useState({
        slide_type: "side_image_left",
        title: "",
        description: "",
        button_text: "",
        button_link: "",
        background_image: "",
        side_image: "",
        video_url: "",
        overlay_color: "",
        sort_order: 0,
        is_active: true,
    })
    const [saving, setSaving] = useState(false)
    const [uploadingBg, setUploadingBg] = useState(false)
    const [uploadingSide, setUploadingSide] = useState(false)
    const [uploadingVideo, setUploadingVideo] = useState(false)

    const MAX_IMAGE_SIZE = 500 * 1024        // 500 KB
    const MAX_VIDEO_SIZE = 10 * 1024 * 1024  // 10 MB

    const handleFileUpload = async (
        file: File,
        field: "background_image" | "side_image" | "video_url",
        setUploading: (v: boolean) => void
    ) => {
        const isVideo = field === "video_url"
        const limit = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
        const limitLabel = isVideo ? "10 MB" : "500 KB"
        if (file.size > limit) {
            alert(`❌ File too large!\n\n"${file.name}" is ${(file.size / 1024).toFixed(1)} KB.\nMaximum allowed size is ${limitLabel}.\n\nPlease compress the file and try again.`)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const response = await fetch("/admin/hero-slides", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                alert("Hero slide created successfully!")
                window.location.href = "/app/hero-slides"
            } else {
                const error = await response.json()
                alert(`Error: ${error.message}`)
            }
        } catch (error) {
            console.error("Error creating slide:", error)
            alert("Failed to create hero slide")
        } finally {
            setSaving(false)
        }
    }

    const showTextField = formData.slide_type !== "static_image"
    const showSideImage =
        formData.slide_type === "side_image_left" || formData.slide_type === "side_image_right"
    const showBackgroundImage = formData.slide_type !== "video"
    const showVideo = formData.slide_type === "video"
    const showButton = formData.slide_type !== "static_image"
    const showOverlay = formData.slide_type === "video" || formData.slide_type === "center_text"

    return (
        <Container>
            <div className="mb-6">
                <Button
                    variant="transparent"
                    onClick={() => (window.location.href = "/app/hero-slides")}
                    className="mb-4"
                >
                    <ArrowLeft />
                    Back to Hero Slides
                </Button>
                <Heading level="h1">Create New Hero Slide</Heading>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    <p className="text-xs text-gray-500 mt-1">
                        {formData.slide_type === "side_image_left" &&
                            "Product/bottle image on the left, text on the right"}
                        {formData.slide_type === "side_image_right" &&
                            "Text on the left, product/bottle image on the right"}
                        {formData.slide_type === "center_text" &&
                            "Full background image with centered text overlay"}
                        {formData.slide_type === "video" &&
                            "Auto-playing background video with optional text overlay"}
                        {formData.slide_type === "static_image" &&
                            "Full-width image only, no text — great for promotional banners"}
                    </p>
                </div>

                {/* Sort Order & Active */}
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
                        <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
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
                            <Label htmlFor="is_active">Active (visible on storefront)</Label>
                        </div>
                    </div>
                </div>

                {/* Text Fields */}
                {showTextField && (
                    <div className="border-t pt-6">
                        <Heading level="h2" className="mb-4">
                            Text Content
                        </Heading>

                        <div className="space-y-4">
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
                                    placeholder="e.g. A Little Surprise"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description" className="mb-2 block">
                                    Description
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
                                    placeholder="A short description shown below the title"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Button / Link */}
                <div className="border-t pt-6">
                    <Heading level="h2" className="mb-4">
                        {showButton ? "Button" : "Link"}
                    </Heading>
                    {formData.slide_type === "static_image" && (
                        <p className="text-sm text-gray-500 mb-3">
                            Clicking the slide will navigate to this link
                        </p>
                    )}

                    <div className={showButton ? "grid grid-cols-2 gap-4" : ""}>
                        {showButton && (
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
                                    placeholder="e.g. DISCOVER"
                                />
                            </div>
                        )}
                        <div>
                            <Label htmlFor="button_link" className="mb-2 block">
                                {showButton ? "Button Link" : "Destination Link"}
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
                    </div>
                </div>

                {/* Background Image */}
                {showBackgroundImage && (
                    <div className="border-t pt-6">
                        <Heading level="h2" className="mb-4">
                            {formData.slide_type === "static_image"
                                ? "Image"
                                : "Background Image"}
                        </Heading>

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
                                placeholder="Image URL or upload"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={uploadingBg}
                                onClick={() =>
                                    document.getElementById("bg-upload")?.click()
                                }
                            >
                                {uploadingBg ? "Uploading..." : "Upload"}
                            </Button>
                            <input
                                id="bg-upload"
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
                            <div className="mt-2">
                                <img
                                    src={formData.background_image}
                                    alt="Background Preview"
                                    className="h-32 w-auto object-cover rounded border"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Side Image (Bottle/Product) */}
                {showSideImage && (
                    <div className="border-t pt-6">
                        <Heading level="h2" className="mb-4">
                            Side Image (Product / Bottle)
                        </Heading>
                        <p className="text-sm text-gray-500 mb-3">
                            This image appears on the{" "}
                            {formData.slide_type === "side_image_left" ? "left" : "right"} side.
                            Use a PNG with transparent background for best results.
                        </p>

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
                                placeholder="Image URL or upload"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={uploadingSide}
                                onClick={() =>
                                    document.getElementById("side-upload")?.click()
                                }
                            >
                                {uploadingSide ? "Uploading..." : "Upload"}
                            </Button>
                            <input
                                id="side-upload"
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
                            <div className="mt-2">
                                <img
                                    src={formData.side_image}
                                    alt="Side Image Preview"
                                    className="h-32 w-auto object-contain rounded border bg-gray-50"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Video */}
                {showVideo && (
                    <div className="border-t pt-6">
                        <Heading level="h2" className="mb-4">
                            Video
                        </Heading>
                        <p className="text-sm text-gray-500 mb-3">
                            Upload an MP4 video. It will auto-play, loop, and be muted on the storefront.
                        </p>

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
                                placeholder="Video URL or upload"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={uploadingVideo}
                                onClick={() =>
                                    document.getElementById("video-upload")?.click()
                                }
                            >
                                {uploadingVideo ? "Uploading..." : "Upload"}
                            </Button>
                            <input
                                id="video-upload"
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
                            <div className="mt-2">
                                <video
                                    src={formData.video_url}
                                    className="h-32 rounded border"
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
                    <div className="border-t pt-6">
                        <Heading level="h2" className="mb-4">
                            Overlay
                        </Heading>

                        <div>
                            <Label htmlFor="overlay_color" className="mb-2 block">
                                Overlay Color (CSS gradient or rgba)
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
                                placeholder="e.g. linear-gradient(135deg, rgba(212,97,122,0.3), rgba(188,148,235,0.3))"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Leave empty for the default pink-purple gradient overlay
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t">
                    <Button type="submit" variant="primary" disabled={saving}>
                        {saving ? "Creating..." : "Create Hero Slide"}
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
    label: "New Hero Slide",
})

export default NewHeroSlidePage
