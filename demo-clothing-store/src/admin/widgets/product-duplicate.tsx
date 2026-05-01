import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Button, Heading, toast } from "@medusajs/ui"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const ProductDuplicateWidget = ({ data }: { data: any }) => {
    const [isDuplicating, setIsDuplicating] = useState(false)
    const navigate = useNavigate()
    const productId = data?.id

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

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Quick Actions</Heading>
            </div>
            <div className="px-6 py-4">
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
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product.details.side.after",
})

export default ProductDuplicateWidget
