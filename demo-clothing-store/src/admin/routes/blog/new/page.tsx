import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Textarea, Label, Switch } from "@medusajs/ui"
import { ArrowLeft } from "@medusajs/icons"
import { useState } from "react"

const NewBlogPostPage = () => {
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        featured_image: "",
        author: "Alariya Team",
        published: false,
        meta_title: "",
        meta_description: "",
    })
    const [saving, setSaving] = useState(false)
    const [uploadingFeatured, setUploadingFeatured] = useState(false)
    const [uploadingContent, setUploadingContent] = useState(false)

    const MAX_IMAGE_SIZE = 500 * 1024 // 500 KB

    const handleImageUpload = async (file: File, type: "featured" | "content") => {
        if (file.size > MAX_IMAGE_SIZE) {
            alert(`❌ File too large!\n\n"${file.name}" is ${(file.size / 1024).toFixed(1)} KB.\nMaximum allowed size is 500 KB.\n\nPlease compress the image and try again.`)
            return
        }

        const isContent = type === "content"
        if (isContent) setUploadingContent(true)
        else setUploadingFeatured(true)

        try {
            const formData = new FormData()
            formData.append("files", file)

            // Use Medusa's built-in upload endpoint (same as product images)
            const response = await fetch("/admin/uploads", {
                method: "POST",
                credentials: "include",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Upload failed")
            }

            const data = await response.json()
            const uploadedUrl = data.files?.[0]?.url

            if (!uploadedUrl) {
                console.error("Upload response:", data)
                throw new Error("No URL returned from upload")
            }

            if (isContent) {
                // Insert markdown image syntax at cursor
                const imageMarkdown = `\n![${file.name}](${uploadedUrl})\n`
                setFormData(prev => ({
                    ...prev,
                    content: prev.content + imageMarkdown
                }))
                alert("Image inserted into content!")
            } else {
                // Set as featured image
                setFormData(prev => ({
                    ...prev,
                    featured_image: uploadedUrl
                }))
                alert("Featured image uploaded!")
            }
        } catch (error) {
            console.error("Error uploading image:", error)
            alert("Failed to upload image")
        } finally {
            if (isContent) setUploadingContent(false)
            else setUploadingFeatured(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const response = await fetch("/admin/blog", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                alert("Blog post created successfully!")
                window.location.href = "/app/blog"
            } else {
                const error = await response.json()
                alert(`Error: ${error.message}`)
            }
        } catch (error) {
            console.error("Error creating post:", error)
            alert("Failed to create post")
        } finally {
            setSaving(false)
        }
    }

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim()
    }

    const handleTitleChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            title: value,
            slug: prev.slug || generateSlug(value),
        }))
    }

    return (
        <Container>
            <div className="mb-6">
                <Button
                    variant="transparent"
                    onClick={() => (window.location.href = "/app/blog")}
                    className="mb-4"
                >
                    <ArrowLeft />
                    Back to Blog Posts
                </Button>
                <Heading level="h1">Create New Blog Post</Heading>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <Label htmlFor="title" className="mb-2 block">
                        Title *
                    </Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Enter post title"
                        required
                    />
                </div>

                {/* Slug */}
                <div>
                    <Label htmlFor="slug" className="mb-2 block">
                        URL Slug *
                    </Label>
                    <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, slug: e.target.value }))
                        }
                        placeholder="url-friendly-slug"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Will be used in the URL: /blog/{formData.slug || "your-slug"}
                    </p>
                </div>

                {/* Excerpt */}
                <div>
                    <Label htmlFor="excerpt" className="mb-2 block">
                        Excerpt
                    </Label>
                    <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                        }
                        placeholder="Short summary for the blog card"
                        rows={3}
                    />
                </div>

                {/* Content */}
                <div>
                    <Label htmlFor="content" className="mb-2 block">
                        Content (Markdown supported) *
                    </Label>
                    <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, content: e.target.value }))
                        }
                        placeholder="Write your blog post in Markdown..."
                        rows={12}
                        required
                    />
                    <div className="mt-2 flex gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="small"
                            disabled={uploadingContent}
                            onClick={() => document.getElementById("content-upload")?.click()}
                        >
                            {uploadingContent ? "Uploading..." : "📷 Insert Image"}
                        </Button>
                        <input
                            id="content-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file, "content")
                            }}
                        />
                        <span className="text-xs text-gray-500 self-center">
                            Upload images to S3 and insert into content
                        </span>
                    </div>

                    {/* Image Preview */}
                    {(() => {
                        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
                        const images = []
                        let match
                        while ((match = imageRegex.exec(formData.content)) !== null) {
                            images.push({ alt: match[1], url: match[2] })
                        }

                        return images.length > 0 ? (
                            <div className="mt-4 p-4 border rounded bg-gray-50">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Images in content ({images.length}):
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <img
                                                src={img.url}
                                                alt={img.alt || `Image ${idx + 1}`}
                                                className="h-20 w-20 object-cover rounded border hover:border-purple-500 transition-all"
                                                title={img.alt || img.url}
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                                <span className="text-white text-xs px-1 text-center truncate max-w-full">
                                                    {img.alt || 'No alt text'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null
                    })()}
                </div>

                {/* Featured Image */}
                <div>
                    <Label htmlFor="featured_image" className="mb-2 block">
                        Featured Image
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            id="featured_image"
                            value={formData.featured_image}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, featured_image: e.target.value }))
                            }
                            placeholder="https://example.com/image.jpg or upload below"
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={uploadingFeatured}
                            onClick={() => document.getElementById("featured-upload")?.click()}
                        >
                            {uploadingFeatured ? "Uploading..." : "Upload"}
                        </Button>
                        <input
                            id="featured-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file, "featured")
                            }}
                        />
                    </div>
                    {formData.featured_image && (
                        <div className="mt-2">
                            <img
                                src={formData.featured_image}
                                alt="Preview"
                                className="h-32 w-auto object-cover rounded border"
                            />
                        </div>
                    )}
                </div>

                {/* Author */}
                <div>
                    <Label htmlFor="author" className="mb-2 block">
                        Author
                    </Label>
                    <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, author: e.target.value }))
                        }
                        placeholder="Alariya Team"
                    />
                </div>

                {/* Published Toggle */}
                <div className="flex items-center gap-3">
                    <Switch
                        id="published"
                        checked={formData.published}
                        onCheckedChange={(checked) =>
                            setFormData((prev) => ({ ...prev, published: checked }))
                        }
                    />
                    <Label htmlFor="published">
                        Publish immediately
                    </Label>
                </div>

                {/* SEO Section */}
                <div className="border-t pt-6">
                    <Heading level="h2" className="mb-4">
                        SEO Settings (Optional)
                    </Heading>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="meta_title" className="mb-2 block">
                                Meta Title
                            </Label>
                            <Input
                                id="meta_title"
                                value={formData.meta_title}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, meta_title: e.target.value }))
                                }
                                placeholder="SEO title for search engines"
                            />
                        </div>

                        <div>
                            <Label htmlFor="meta_description" className="mb-2 block">
                                Meta Description
                            </Label>
                            <Textarea
                                id="meta_description"
                                value={formData.meta_description}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        meta_description: e.target.value,
                                    }))
                                }
                                placeholder="SEO description for search results"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t">
                    <Button type="submit" variant="primary" disabled={saving}>
                        {saving ? "Creating..." : "Create Blog Post"}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => (window.location.href = "/app/blog")}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "New Blog Post",
})

export default NewBlogPostPage
