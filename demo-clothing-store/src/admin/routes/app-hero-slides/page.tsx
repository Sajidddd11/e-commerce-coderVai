import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Table, Badge } from "@medusajs/ui"
import { PencilSquare, Trash, Plus, Phone } from "@medusajs/icons"
import { useEffect, useState } from "react"
import { useUserRole } from "../../hooks/useUserRole"

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
    none: "bg-ui-bg-subtle text-ui-fg-muted",
    shop: "bg-blue-50 text-blue-700",
    new_arrivals: "bg-green-50 text-green-700",
    best_selling: "bg-amber-50 text-amber-700",
    recommended: "bg-purple-50 text-purple-700",
    category: "bg-teal-50 text-teal-700",
    collection: "bg-indigo-50 text-indigo-700",
    product: "bg-rose-50 text-rose-700",
    search: "bg-orange-50 text-orange-700",
}

const AppHeroSlidesListPage = () => {
    const [slides, setSlides] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { role } = useUserRole()
    const isAdmin = role === "admin"

    useEffect(() => {
        fetchSlides()
    }, [])

    const fetchSlides = async () => {
        try {
            const response = await fetch("/admin/app-hero-slides", {
                credentials: "include",
            })
            const data = await response.json()
            setSlides(data.slides || [])
        } catch (error) {
            console.error("Error fetching app hero slides:", error)
        } finally {
            setLoading(false)
        }
    }

    const deleteSlide = async (id: string) => {
        if (!confirm("Delete this mobile hero slide?")) return
        try {
            await fetch(`/admin/app-hero-slides/${id}`, {
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
            await fetch(`/admin/app-hero-slides/${slide.id}`, {
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
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <Heading level="h1">Mobile App Hero</Heading>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                        📱 App Only
                    </span>
                </div>
                <Button
                    onClick={() => (window.location.href = "/app/app-hero-slides/new")}
                    variant="primary"
                >
                    <Plus />
                    Add Slide
                </Button>
            </div>

            <p className="text-sm text-ui-fg-subtle mb-6 max-w-[640px]">
                Manage hero banner slides shown in the <strong>mobile app</strong>. These are separate from the web storefront hero. 
                Each slide can deep-link to any section of the app — categories, collections, products, or search.
            </p>

            {slides.length === 0 ? (
                <div className="text-center py-16 border border-ui-border-base rounded-2xl bg-ui-bg-subtle/50">
                    <Phone className="mx-auto w-10 h-10 text-ui-fg-muted mb-4 opacity-40" />
                    <p className="text-ui-fg-subtle mb-2 font-medium">No mobile hero slides yet</p>
                    <p className="text-ui-fg-muted text-sm mb-6">The app will show its built-in fallback until you add slides here.</p>
                    <Button onClick={() => (window.location.href = "/app/app-hero-slides/new")} variant="secondary">
                        Create First Slide
                    </Button>
                </div>
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell className="w-12">Order</Table.HeaderCell>
                            <Table.HeaderCell className="w-24">Image</Table.HeaderCell>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                            <Table.HeaderCell>Destination</Table.HeaderCell>
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
                                    {slide.image ? (
                                        <img
                                            src={slide.image}
                                            alt="Preview"
                                            className="h-12 w-20 object-cover rounded shadow-sm border border-ui-border-base"
                                        />
                                    ) : (
                                        <div className="h-12 w-20 bg-ui-bg-subtle rounded flex items-center justify-center border border-ui-border-base border-dashed">
                                            <Phone className="text-ui-fg-muted opacity-40" />
                                        </div>
                                    )}
                                </Table.Cell>
                                <Table.Cell className="font-semibold text-ui-fg-base">
                                    {slide.title || <span className="text-ui-fg-muted italic opacity-50">No title</span>}
                                    {slide.subtitle && (
                                        <p className="text-xs text-ui-fg-muted font-normal mt-0.5">{slide.subtitle}</p>
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    <div className="flex flex-col gap-1">
                                        <span
                                            className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border border-transparent w-fit ${LINK_TYPE_COLORS[slide.link_type] || LINK_TYPE_COLORS.none}`}
                                        >
                                            {LINK_TYPE_LABELS[slide.link_type] || slide.link_type}
                                        </span>
                                        {slide.link_label && (
                                            <span className="text-xs text-ui-fg-subtle">→ {slide.link_label}</span>
                                        )}
                                    </div>
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
                                            onClick={() => (window.location.href = `/app/app-hero-slides/${slide.id}`)}
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
    label: "Mobile Hero",
    icon: Phone,
})

export default AppHeroSlidesListPage
