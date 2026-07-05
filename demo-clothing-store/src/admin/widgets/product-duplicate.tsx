import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Button, Heading, toast, Input, Label } from "@medusajs/ui"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const ProductDuplicateWidget = ({ data }: { data: any }) => {
    const [isDuplicating, setIsDuplicating] = useState(false)
    const [maxCoins, setMaxCoins] = useState<string>("")
    const [isSavingCoins, setIsSavingCoins] = useState(false)
    const navigate = useNavigate()
    const productId = data?.id

    // Load initial max_usable_coins from product metadata
    useEffect(() => {
        if (data?.metadata?.max_usable_coins !== undefined && data?.metadata?.max_usable_coins !== null) {
            setMaxCoins(String(data.metadata.max_usable_coins))
        } else {
            setMaxCoins("")
        }
    }, [data?.metadata?.max_usable_coins])

    const handleDuplicate = async () => {
        if (!productId) {
            toast.error("Error", {
                description: "Product ID not found",
            })
            return
        }

        setIsDuplicating(true)

        try {
            const response = await fetch(`/admin/products/${productId}/duplicate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            })

            if (!response.ok) {
                throw new Error("Failed to duplicate product")
            }

            const { product } = await response.json()

            toast.success("Success", {
                description: "Product duplicated successfully!",
            })

            // Navigate to the new product
            navigate(`/products/${product.id}`)
        } catch (error) {
            console.error("Duplication error:", error)
            toast.error("Error", {
                description: "Failed to duplicate product. Please try again.",
            })
        } finally {
            setIsDuplicating(false)
        }
    }

    const handleSaveCoins = async () => {
        if (!productId) return
        setIsSavingCoins(true)
        try {
            const val = maxCoins.trim() === "" ? null : Number(maxCoins)
            if (val !== null && (isNaN(val) || val < 0)) {
                toast.error("Error", {
                    description: "Maximum usable coins must be a positive number",
                })
                setIsSavingCoins(false)
                return
            }

            const response = await fetch(`/admin/products/${productId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    metadata: {
                        ...data?.metadata,
                        max_usable_coins: val,
                    },
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to update product settings")
            }

            toast.success("Success", {
                description: "Zahan Coins settings updated successfully!",
            })

            // Refresh the page after short delay to reload new data
            setTimeout(() => window.location.reload(), 500)
        } catch (error) {
            console.error("Save coins error:", error)
            toast.error("Error", {
                description: "Failed to update coins limit. Please try again.",
            })
        } finally {
            setIsSavingCoins(false)
        }
    }

    return (
        <Container className="divide-y p-0">
            {/* Quick Actions Section */}
            <div>
                <div className="px-6 py-4">
                    <Heading level="h2" className="mb-3">Quick Actions</Heading>
                    <Button
                        onClick={handleDuplicate}
                        disabled={isDuplicating}
                        variant="secondary"
                        className="w-full"
                    >
                        {isDuplicating ? "Duplicating..." : "Duplicate Product"}
                    </Button>
                    <p className="text-xs text-ui-fg-subtle mt-2">
                        Create a copy of this product with all options and variants
                    </p>
                </div>
            </div>

            {/* Zahan Coins Settings Section */}
            <div>
                <div className="px-6 py-4 flex flex-col gap-y-3">
                    <Heading level="h2">Zahan Coins Settings</Heading>
                    <div className="flex flex-col gap-y-1.5">
                        <Label htmlFor="max-coins-input">Max Usable Coins (Per Unit)</Label>
                        <div className="flex gap-x-2">
                            <Input
                                id="max-coins-input"
                                type="number"
                                placeholder="No limit"
                                value={maxCoins}
                                onChange={(e) => setMaxCoins(e.target.value)}
                                disabled={isSavingCoins}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSaveCoins}
                                disabled={isSavingCoins}
                                variant="secondary"
                            >
                                {isSavingCoins ? "Saving..." : "Save"}
                            </Button>
                        </div>
                        <p className="text-xs text-ui-fg-subtle">
                            Specify maximum Zahan Coins usable for this product. Leave blank for no limit.
                        </p>
                    </div>
                </div>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product.details.side.after",
})

export default ProductDuplicateWidget
