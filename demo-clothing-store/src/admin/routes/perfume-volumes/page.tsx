import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Table, Input, Label, Text } from "@medusajs/ui"
import { Plus, Trash, ArrowRight, Beaker, Receipt } from "@medusajs/icons"
import { useEffect, useState } from "react"

const PerfumeVolumesPage = () => {
    const [volumes, setVolumes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newVolume, setNewVolume] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [isPrinting, setIsPrinting] = useState(false)


    useEffect(() => {
        fetchVolumes()
    }, [])

    const fetchVolumes = async () => {
        try {
            const response = await fetch("/admin/perfume-volumes", {
                credentials: "include",
            })
            const data = await response.json()
            setVolumes(data.perfume_volumes || [])
        } catch (error) {
            console.error("Error fetching volumes:", error)
        } finally {
            setLoading(false)
        }
    }

    const createVolume = async (e: React.FormEvent) => {
        e.preventDefault()
        const volumeNum = parseInt(newVolume)
        if (!volumeNum || volumeNum <= 0) {
            alert("Please enter a valid volume in mL")
            return
        }

        setIsCreating(true)
        try {
            const response = await fetch("/admin/perfume-volumes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ volume_ml: volumeNum }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message)
            }

            setNewVolume("")
            fetchVolumes()
        } catch (error: any) {
            console.error("Error creating volume:", error)
            alert(error.message || "Failed to create volume")
        } finally {
            setIsCreating(false)
        }
    }

    const deleteVolume = async (id: string, bottleCount: number) => {
        if (bottleCount > 0) {
            if (!confirm(`This volume contains ${bottleCount} bottles! Deleting it will permanently delete all its bottles as well. Are you completely sure you want to proceed?`)) {
                return
            }
        } else {
            if (!confirm("Are you sure you want to delete this volume category?")) return
        }

        try {
            await fetch(`/admin/perfume-volumes/${id}`, {
                method: "DELETE",
                credentials: "include",
            })
            fetchVolumes()
        } catch (error) {
            console.error("Error deleting volume:", error)
            alert("Failed to delete volume")
        }
    }

    const handlePrintAll = () => {
        setIsPrinting(true)
        try {
            const printHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Bottle Library - All Categories</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                            padding: 0;
                            margin: 0;
                            color: #111827;
                        }
                        @page {
                            margin: 15mm;
                        }
                        .header {
                            border-bottom: 2px solid #e5e7eb;
                            margin-bottom: 20px;
                            padding-bottom: 10px;
                        }
                        .category-section {
                            margin-bottom: 30px;
                        }
                        .category-title {
                            font-size: 18px;
                            font-weight: bold;
                            background: #f9fafb;
                            padding: 6px 12px;
                            border-left: 4px solid #111827;
                            margin-bottom: 15px;
                            page-break-after: avoid;
                        }
                        .bottles-grid {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 15px;
                        }
                        .bottle-card {
                            border: 1px solid #e5e7eb;
                            padding: 10px;
                            border-radius: 6px;
                            text-align: center;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            break-inside: avoid;
                        }
                        .bottle-image {
                            width: 100px;
                            height: 100px;
                            object-fit: contain;
                            margin-bottom: 10px;
                            border: 1px solid #f3f4f6;
                            padding: 4px;
                            border-radius: 4px;
                        }
                        .bottle-name {
                            font-weight: 600;
                            font-size: 14px;
                            margin-bottom: 4px;
                        }
                        .bottle-price {
                            font-size: 13px;
                            color: #6b7280;
                        }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 style="margin: 0;">Al-Ariya Perfume Bottle Library</h1>
                        <p style="color: #6b7280; margin-top: 5px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                    </div>

                    ${volumes.map(vol => `
                        <div class="category-section">
                            <div class="category-title">${vol.volume_ml} mL Category (${vol.bottles?.length || 0} items)</div>
                            ${vol.bottles?.length > 0 ? `
                                <div class="bottles-grid">
                                    ${vol.bottles.map((bottle: any) => `
                                        <div class="bottle-card">
                                            ${bottle.image_url ? `<img src="${bottle.image_url}" class="bottle-image" />` : '<div class="bottle-image" style="background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #9ca3af;">No Image</div>'}
                                            <div class="bottle-name">${bottle.name}</div>
                                            <div class="bottle-price">${bottle.base_price.toFixed(2)} BDT</div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : '<p style="color: #9ca3af; font-style: italic; margin-left: 12px;">No bottles assigned to this category.</p>'}
                        </div>
                    `).join('')}

                    <script>
                        window.onload = function() {
                            setTimeout(() => {
                                window.print();
                                window.onafterprint = function() {
                                    // No action needed
                                }
                            }, 500);
                        }
                    </script>
                </body>
                </html>
            `

            const iframe = document.createElement('iframe')
            iframe.style.display = 'none'
            document.body.appendChild(iframe)
            const iframeDoc = iframe.contentWindow?.document
            if (iframeDoc) {
                iframeDoc.open()
                iframeDoc.write(printHTML)
                iframeDoc.close()
            }
            setTimeout(() => {
                document.body.removeChild(iframe)
                setIsPrinting(false)
            }, 2000)
        } catch (error) {
            console.error("Error printing bottles:", error)
            alert("Failed to generate print view")
            setIsPrinting(false)
        }
    }


    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center h-64 bg-ui-bg-subtle rounded-xl border border-ui-border-base">
                    <p className="text-ui-fg-muted font-medium animate-pulse">Loading Volumes...</p>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className="flex flex-col gap-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <Heading level="h1">Perfume Volumes Library</Heading>
                        <Text className="text-ui-fg-subtle mt-2">
                            Step 1: Create the container volumes here (e.g., 15mL, 30mL).
                            Clicking on a volume allows you to upload its specific bottles and set base prices inside.
                        </Text>
                    </div>
                    <Button 
                        variant="secondary" 
                        onClick={handlePrintAll} 
                        disabled={isPrinting || volumes.length === 0}
                    >
                        <Receipt />
                        {isPrinting ? "Preparing..." : "Print Bottle List"}
                    </Button>

                </div>


                <form onSubmit={createVolume} className="flex gap-4 items-end bg-ui-bg-subtle p-4 border rounded-lg">
                    <div>
                        <Label htmlFor="new_volume" className="mb-2 block">Create New Volume (mL)</Label>
                        <Input
                            id="new_volume"
                            type="number"
                            min="1"
                            value={newVolume}
                            onChange={(e) => setNewVolume(e.target.value)}
                            placeholder="e.g. 50"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={isCreating} variant="secondary">
                        <Plus />
                        {isCreating ? "Adding..." : "Add Volume"}
                    </Button>
                </form>

                {volumes.length === 0 ? (
                    <div className="text-center py-16 border rounded-2xl border-dashed border-ui-border-base bg-ui-bg-subtle/50">
                        <Beaker className="mx-auto w-10 h-10 text-ui-fg-muted mb-4 opacity-40" />
                        <p className="text-ui-fg-subtle font-medium">No volumes configured yet</p>
                    </div>
                ) : (
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Volume Size</Table.HeaderCell>
                                <Table.HeaderCell>Bottles Assigned</Table.HeaderCell>
                                <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {volumes.map((vol) => (
                                <Table.Row key={vol.id}>
                                    <Table.Cell>
                                        <span className="font-bold text-lg text-ui-fg-base">{vol.volume_ml} mL</span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className="text-ui-fg-subtle font-medium">
                                            {vol.bottles?.length || 0} bottle types
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="small"
                                                variant="danger"
                                                onClick={() => deleteVolume(vol.id, vol.bottles?.length || 0)}
                                            >
                                                <Trash />
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="primary"
                                                onClick={() => (window.location.href = `/app/perfume-volumes/${vol.id}`)}
                                            >
                                                Manage Bottles <ArrowRight />
                                            </Button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                )}
            </div>
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Bottle Library",
    icon: Beaker,
})

export default PerfumeVolumesPage
