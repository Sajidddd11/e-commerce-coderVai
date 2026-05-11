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
        if (!confirm("Are you sure you want to delete this hero slide?")) return

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
                <Heading level="h1">Hero Slides</Heading>
                <Button
                    onClick={() => (window.location.href = "/app/hero-slides/new")}
                    variant="primary"
                >
                    <Plus />
                    Add Slide
                </Button>
            </div>

            <p className="text-sm text-ui-fg-subtle mb-5 max-w-[600px]">
                Manage the hero slider on your storefront. Drag order by setting sort values. Active slides are shown on the homepage.
            </p>

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
                            <Table.HeaderCell>Order</Table.HeaderCell>
                            <Table.HeaderCell>Preview</Table.HeaderCell>
                            <Table.HeaderCell>Type</Table.HeaderCell>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {slides.map((slide) => (
                            <Table.Row key={slide.id}>
                                <Table.Cell>
                                    <span className="font-mono text-xs text-ui-fg-muted bg-ui-bg-subtle px-2 py-0.5 rounded border border-ui-border-base">
                                        {slide.sort_order}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    {slide.background_image ? (
                                        <img
                                            src={slide.background_image}
                                            alt="Preview"
                                            className="h-12 w-20 object-cover rounded shadow-sm border border-ui-border-base"
                                        />
                                    ) : slide.video_url ? (
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
                                    <code className="text-[11px] bg-ui-bg-subtle px-2.5 py-1 rounded-full border border-ui-border-base text-ui-fg-subtle font-semibold">
                                        {SLIDE_TYPE_LABELS[slide.slide_type] || slide.slide_type}
                                    </code>
                                </Table.Cell>
                                <Table.Cell className="font-bold text-ui-fg-base">
                                    {slide.title || <span className="text-ui-fg-muted italic opacity-50">No title</span>}
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
                        ))}
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
