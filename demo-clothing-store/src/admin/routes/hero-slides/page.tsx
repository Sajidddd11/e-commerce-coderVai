import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Table, Badge } from "@medusajs/ui"
import { PencilSquare, Trash, Plus, Photo } from "@medusajs/icons"
import { useEffect, useState } from "react"
import { useUserRole } from "../../hooks/useUserRole"

const SLIDE_TYPE_LABELS: Record<string, string> = {
    side_image_left: "Side Image (Left)",
    side_image_right: "Side Image (Right)",
    center_text: "Center Text + BG",
    video: "Video Background",
    static_image: "Static Image",
}

const LINK_TYPE_LABELS: Record<string, string> = {
    none: "Decorative (No Link)",
    shop: "Shop — All Products",
    new_arrivals: "Shop — New Arrivals",
    best_selling: "Shop — Best Selling",
    recommended: "Recommended For You",
    category: "Category",
    collection: "Collection",
    product: "Product Page",
    search: "Search Results",
}

const LINK_TYPE_COLORS: Record<string, string> = {
    none: "bg-ui-bg-subtle text-ui-fg-muted border-ui-border-base",
    shop: "bg-blue-50 text-blue-700 border-blue-200",
    new_arrivals: "bg-green-50 text-green-700 border-green-200",
    best_selling: "bg-amber-50 text-amber-700 border-amber-200",
    recommended: "bg-purple-50 text-purple-700 border-purple-200",
    category: "bg-teal-50 text-teal-700 border-teal-200",
    collection: "bg-indigo-50 text-indigo-700 border-indigo-200",
    product: "bg-rose-50 text-rose-700 border-rose-200",
    search: "bg-orange-50 text-orange-700 border-orange-200",
}

const HeroSlidesListPage = () => {
    const [slides, setSlides] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { role } = useUserRole()
    const isAdmin = role === "admin"

    useEffect(() => {
        fetchSlides()
    }, [])

    const fetchSlides = async () => {
        try {
            const response = await fetch("/admin/hero-slides", {
                credentials: "include",
            })
            const data = await response.json()
            setSlides(data.slides || [])
        } catch (error) {
            console.error("Error fetching hero slides:", error)
        } finally {
            setLoading(false)
        }
    }

    const deleteSlide = async (id: string) => {
        if (!confirm("Are you sure you want to delete this hero slide? This cannot be undone.")) return

        try {
            await fetch(`/admin/hero-slides/${id}`, {
                method: "DELETE",
                credentials: "include",
            })
            fetchSlides()
        } catch (error) {
            console.error("Error deleting slide:", error)
            alert("Failed to delete slide")
        }
    }

    const toggleActive = async (slide: any) => {
        try {
            await fetch(`/admin/hero-slides/${slide.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ is_active: !slide.is_active }),
            })
            fetchSlides()
        } catch (error) {
            console.error("Error toggling slide:", error)
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

    return (
        <Container>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Heading level="h1">Hero Banners</Heading>
                    <p className="text-sm text-ui-fg-subtle mt-1">
                        Manage slider banners shown on Web, Mobile App, or both.
                    </p>
                </div>
                <Button
                    onClick={() => (window.location.href = "/app/hero-slides/new")}
                    variant="primary"
                >
                    <Plus />
                    Add Slide
                </Button>
            </div>

            {slides.length === 0 ? (
                <div className="text-center py-16 border border-ui-border-base rounded-2xl bg-ui-bg-subtle/50">
                    <Photo className="mx-auto w-10 h-10 text-ui-fg-muted mb-4 opacity-40" />
                    <p className="text-ui-fg-subtle mb-6 font-medium">No hero slides yet</p>
                    <Button onClick={() => (window.location.href = "/app/hero-slides/new")} variant="secondary">
                        Create Your First Slide
                    </Button>
                </div>
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell className="w-16">Order</Table.HeaderCell>
                            <Table.HeaderCell className="w-28">Preview</Table.HeaderCell>
                            <Table.HeaderCell className="w-32">Platforms</Table.HeaderCell>
                            <Table.HeaderCell className="w-56">Configuration Details</Table.HeaderCell>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                            <Table.HeaderCell className="w-24">Status</Table.HeaderCell>
                            <Table.HeaderCell className="text-right w-32">Actions</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {slides.map((slide) => {
                            const previewImage = slide.is_web ? slide.background_image : slide.image

                            return (
                                <Table.Row key={slide.id}>
                                    <Table.Cell>
                                        <span className="font-mono text-xs text-ui-fg-muted bg-ui-bg-subtle px-2 py-0.5 rounded border border-ui-border-base">
                                            {slide.sort_order}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="h-12 w-20 object-cover rounded shadow-sm border border-ui-border-base"
                                            />
                                        ) : slide.is_web && slide.video_url ? (
                                            <div className="h-12 w-20 bg-ui-bg-subtle rounded flex items-center justify-center text-[10px] font-bold text-ui-fg-muted border border-ui-border-base uppercase tracking-tighter">
                                                Video
                                            </div>
                                        ) : (
                                            <div className="h-12 w-20 bg-ui-bg-subtle rounded flex items-center justify-center border border-ui-border-base border-dashed">
                                                <Photo className="text-ui-fg-muted opacity-40" />
                                            </div>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="flex flex-wrap gap-1.5">
                                            {slide.is_web && (
                                                <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                                                    💻 Web
                                                </span>
                                            )}
                                            {slide.is_app && (
                                                <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-violet-100 text-violet-800 border border-violet-200">
                                                    📱 App
                                                </span>
                                            )}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="flex flex-col gap-1.5">
                                            {slide.is_web && slide.slide_type && (
                                                <div className="text-xs">
                                                    <span className="text-ui-fg-muted">Web:</span>{" "}
                                                    <code className="text-[11px] bg-ui-bg-subtle px-1.5 py-0.5 rounded border border-ui-border-base font-semibold">
                                                        {SLIDE_TYPE_LABELS[slide.slide_type] || slide.slide_type}
                                                    </code>
                                                </div>
                                            )}
                                            {slide.is_app && (
                                                <div className="text-xs flex flex-col gap-0.5">
                                                    <span className="text-ui-fg-muted">App Destination:</span>
                                                    <span
                                                        className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${LINK_TYPE_COLORS[slide.link_type] || LINK_TYPE_COLORS.none}`}
                                                    >
                                                        {LINK_TYPE_LABELS[slide.link_type] || slide.link_type}
                                                    </span>
                                                    {slide.link_label && (
                                                        <span className="text-[11px] text-ui-fg-subtle truncate max-w-[180px]">
                                                            → {slide.link_label}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell className="font-semibold text-ui-fg-base">
                                        {slide.title || <span className="text-ui-fg-muted italic opacity-50">No title</span>}
                                        {slide.is_app && slide.subtitle && (
                                            <p className="text-xs text-ui-fg-muted font-normal mt-0.5 truncate max-w-[200px]">
                                                Sub: {slide.subtitle}
                                            </p>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <button onClick={() => toggleActive(slide)} className="cursor-pointer">
                                            {slide.is_active ? (
                                                <Badge color="green">Active</Badge>
                                            ) : (
                                                <Badge color="grey">Inactive</Badge>
                                            )}
                                        </button>
                                    </Table.Cell>
                                    <Table.Cell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                size="small"
                                                variant="secondary"
                                                onClick={() =>
                                                    (window.location.href = `/app/hero-slides/${slide.id}`)
                                                }
                                            >
                                                <PencilSquare />
                                                Edit
                                            </Button>
                                            {isAdmin && (
                                                <Button
                                                    size="small"
                                                    variant="danger"
                                                    onClick={() => deleteSlide(slide.id)}
                                                >
                                                    <Trash />
                                                </Button>
                                            )}
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table>
            )}
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Hero Slides",
    icon: Photo,
})

export default HeroSlidesListPage
