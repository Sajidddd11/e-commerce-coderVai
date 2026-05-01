import { Container, Heading, Button, Table, Input, Label, Text } from "@medusajs/ui"
import { ArrowLeft, Trash, Plus } from "@medusajs/icons"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

const PerfumeBottlesPage = () => {
    const { id: volumeId } = useParams()
    const [volume, setVolume] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Form state
    const [newName, setNewName] = useState("")
    const [newPrice, setNewPrice] = useState("")
    const [newImageUrl, setNewImageUrl] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editingBottleId, setEditingBottleId] = useState<string | null>(null)

    useEffect(() => {
        if (volumeId) {
            fetchVolumeDetails()
        }
    }, [volumeId])

    const fetchVolumeDetails = async () => {
        try {
            const response = await fetch(`/admin/perfume-volumes/${volumeId}`, {
                credentials: "include",
            })
            const data = await response.json()
            setVolume(data.perfume_volume)
        } catch (error) {
            console.error("Error fetching volume details:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const MAX_IMAGE_SIZE = 500 * 1024 // 500 KB
        if (file.size > MAX_IMAGE_SIZE) {
            alert(`❌ File too large!\n\n"${file.name}" is ${(file.size / 1024).toFixed(1)} KB.\nMaximum allowed size is 500 KB.\n\nPlease compress the image and try again.`)
            e.target.value = ""
            return
        }

        setIsUploading(true)
        try {
            const fd = new FormData()
            fd.append("files", file)

            const response = await fetch("/admin/uploads", {
                method: "POST",
                credentials: "include",
                body: fd,
            })

            const data = await response.json()
            if (data.files?.[0]?.url) {
                setNewImageUrl(data.files[0].url)
            }
        } catch (error) {
            console.error("Upload error:", error)
            alert("Failed to upload image")
        } finally {
            setIsUploading(false)
        }
    }

    const saveBottle = async (e: React.FormEvent) => {
        e.preventDefault()

        const basePriceNum = parseFloat(newPrice)
        if (!newName || isNaN(basePriceNum) || basePriceNum < 0) {
            alert("Please enter a valid valid name and base price")
            return
        }

        setIsSaving(true)
        try {
            const payload = {
                name: newName,
                base_price: basePriceNum,
                image_url: newImageUrl,
                ...(editingBottleId ? {} : { volume_id: volumeId })
            }

            const url = editingBottleId
                ? `/admin/perfume-bottles/${editingBottleId}`
                : "/admin/perfume-bottles"

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message)
            }

            // Reset form
            cancelEdit()

            // Refresh list
            fetchVolumeDetails()
        } catch (error: any) {
            console.error("Error saving bottle:", error)
            alert(error.message || "Failed to save bottle")
        } finally {
            setIsSaving(false)
        }
    }

    const startEdit = (bottle: any) => {
        setEditingBottleId(bottle.id)
        setNewName(bottle.name)
        setNewPrice(bottle.base_price.toString())
        setNewImageUrl(bottle.image_url || "")
        // scroll to top to view form
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const cancelEdit = () => {
        setEditingBottleId(null)
        setNewName("")
        setNewPrice("")
        setNewImageUrl("")
    }

    const deleteBottle = async (bottleId: string) => {
        if (!confirm("Are you sure you want to delete this bottle type?")) return

        try {
            await fetch(`/admin/perfume-bottles/${bottleId}`, {
                method: "DELETE",
                credentials: "include",
            })
            fetchVolumeDetails()
        } catch (error) {
            console.error("Error deleting bottle:", error)
            alert("Failed to delete bottle")
        }
    }

    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center h-64">
                    <p>Loading...</p>
                </div>
            </Container>
        )
    }

    if (!volume) {
        return (
            <Container>
                <Heading level="h1">Volume Not Found</Heading>
                <Button onClick={() => window.location.href = "/app/perfume-volumes"} className="mt-4">
                    Back to Library
                </Button>
            </Container>
        )
    }

    const bottles = volume.bottles || []

    return (
        <Container>
            <div className="mb-6">
                <Button
                    variant="transparent"
                    onClick={() => (window.location.href = "/app/perfume-volumes")}
                    className="mb-4"
                >
                    <ArrowLeft />
                    Back to Volumes
                </Button>
                <Heading level="h1">Manage {volume.volume_ml}mL Bottles</Heading>
                <Text className="text-gray-500 mt-2">
                    Add or remove specific bottle designs that are available in {volume.volume_ml}mL size.
                </Text>
            </div>

            {/* Add/Edit Bottle Form */}
            <form onSubmit={saveBottle} className={`p-6 border rounded-lg mb-8 space-y-4 transition-colors ${editingBottleId ? 'bg-ui-bg-base border-[#D4617A]/50 shadow-sm' : 'bg-ui-bg-subtle'}`}>
                <div className="flex justify-between items-center mb-2">
                    <Heading level="h2" className="text-lg">
                        {editingBottleId ? `Edit Bottle Type (${volume.volume_ml}mL)` : `Add New Bottle Type (${volume.volume_ml}mL)`}
                    </Heading>
                    {editingBottleId && (
                        <Button type="button" variant="danger" size="small" onClick={cancelEdit}>
                            Cancel Edit
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="b_name" className="mb-2 block">Bottle Identifier / Name *</Label>
                        <Input
                            id="b_name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g. Type 1, Luxury Square"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="b_price" className="mb-2 block">Empty Bottle Base Price (BDT) *</Label>
                        <Input
                            id="b_price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            placeholder="e.g. 75.00"
                            required
                        />
                    </div>
                </div>

                <div>
                    <Label className="mb-2 block">Bottle Image</Label>
                    <div className="flex gap-2">
                        <Input
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Image URL or upload"
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isUploading}
                            onClick={() => document.getElementById("bottle-img-upload")?.click()}
                        >
                            {isUploading ? "Uploading..." : "Upload Photo"}
                        </Button>
                        <input
                            id="bottle-img-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                        />
                    </div>
                </div>

                {newImageUrl && (
                    <div className="mt-2 text-center p-4 border bg-white rounded-lg">
                        <img src={newImageUrl} alt="Preview" className="h-32 object-contain mx-auto" />
                    </div>
                )}

                <div className="pt-2">
                    <Button type="submit" variant="primary" disabled={isSaving || isUploading}>
                        <Plus />
                        {isSaving ? "Saving..." : editingBottleId ? "Update Bottle" : `Add Bottle to ${volume.volume_ml}mL`}
                    </Button>
                </div>
            </form>

            <Heading level="h2" className="text-lg mb-4">Current Bottles configured ({bottles.length})</Heading>

            {bottles.length === 0 ? (
                <div className="text-center py-12 border rounded-lg border-dashed">
                    <p className="text-gray-500">No bottles added to this volume yet</p>
                </div>
            ) : (
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Image</Table.HeaderCell>
                            <Table.HeaderCell>Name / Identifier</Table.HeaderCell>
                            <Table.HeaderCell>Base Price (BDT)</Table.HeaderCell>
                            <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {bottles.map((bottle: any) => (
                            <Table.Row key={bottle.id} className={editingBottleId === bottle.id ? "bg-ui-bg-subtle" : ""}>
                                <Table.Cell>
                                    {bottle.image_url ? (
                                        <img
                                            src={bottle.image_url}
                                            alt={bottle.name}
                                            className="h-12 w-12 object-contain border p-1 rounded"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 bg-gray-100 flex items-center justify-center text-xs text-gray-400 border rounded">
                                            No Img
                                        </div>
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="font-medium text-lg">{bottle.name}</span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span>{bottle.base_price.toFixed(2)}</span>
                                </Table.Cell>
                                <Table.Cell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="small"
                                            variant="secondary"
                                            onClick={() => startEdit(bottle)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="danger"
                                            onClick={() => deleteBottle(bottle.id)}
                                        >
                                            <Trash /> Remove
                                        </Button>
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

export default PerfumeBottlesPage
