import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Button, Heading, Input, Label, toast, Text } from "@medusajs/ui"
import { useState, useEffect } from "react"

const PerfumeVariantSetupWidget = ({ data }: { data: any }) => {
    const [isProcessing, setIsProcessing] = useState(false)
    const [pricePerMl, setPricePerMl] = useState("")
    const [volumeCount, setVolumeCount] = useState<number | null>(null)
    const [bottleCount, setBottleCount] = useState<number | null>(null)
    const [loadingAssets, setLoadingAssets] = useState(true)

    const productId = data?.id

    useEffect(() => {
        const fetchBottleAssets = async () => {
            try {
                const response = await fetch("/admin/perfume-volumes", {
                    credentials: "include",
                })
                const result = await response.json()
                const vols = result.perfume_volumes || []

                setVolumeCount(vols.length)

                let totalBottles = 0
                for (const v of vols) {
                    totalBottles += (v.bottles?.length || 0)
                }
                setBottleCount(totalBottles)

            } catch (error) {
                console.error("Error fetching bottle assets:", error)
            } finally {
                setLoadingAssets(false)
            }
        }

        fetchBottleAssets()
    }, [])

    const handleAutoSetup = async () => {
        if (!productId) {
            toast.error("Error", {
                description: "Product ID not found",
            })
            return
        }

        if (!pricePerMl) {
            toast.error("Error", {
                description: "Please enter price per mL",
            })
            return
        }

        const pricePerMlNum = parseFloat(pricePerMl)
        if (isNaN(pricePerMlNum) || pricePerMlNum < 0) {
            toast.error("Error", {
                description: "Please enter a valid price per mL",
            })
            return
        }

        if (bottleCount === 0) {
            toast.error("Error", {
                description: "No bottle assets found. Please add them in the Bottle Library first.",
            })
            return
        }

        setIsProcessing(true)

        try {
            const response = await fetch(`/admin/products/${productId}/auto-setup-perfume`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    price_per_ml: pricePerMlNum,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Failed to setup variants")
            }

            toast.success("Setup Started!", {
                description: `Creating variants from ${bottleCount} specific bottle assets across ${volumeCount} volumes. Checking progress...`,
            })

            // Poll for completion
            let attempts = 0
            const maxAttempts = 30 // 30 seconds max
            const pollInterval = 1000 // Check every 1 second

            const checkCompletion = async () => {
                attempts++

                try {
                    const checkResponse = await fetch(`/admin/products/${productId}`, {
                        credentials: "include",
                    })

                    if (checkResponse.ok) {
                        const { product } = await checkResponse.json()

                        // Check if variants exist matching the asset count
                        if (product?.variants && product.variants.length >= (bottleCount || 0)) {
                            toast.success("Complete!", {
                                description: `Successfully created ${product.variants.length} variants. Refreshing...`,
                            })
                            setTimeout(() => window.location.reload(), 500)
                            return
                        }
                    }

                    if (attempts < maxAttempts) {
                        setTimeout(checkCompletion, pollInterval)
                    } else {
                        toast.warning("Taking longer than expected", {
                            description: "Variants are still being created. Refreshing page...",
                        })
                        setTimeout(() => window.location.reload(), 1000)
                    }
                } catch (error) {
                    console.error("Error checking completion:", error)
                    if (attempts >= maxAttempts) {
                        setTimeout(() => window.location.reload(), 1000)
                    } else {
                        setTimeout(checkCompletion, pollInterval)
                    }
                }
            }

            // Start polling after 2 seconds
            setTimeout(checkCompletion, 2000)
        } catch (error) {
            console.error("Auto-setup error:", error)
            toast.error("Error", {
                description: error instanceof Error ? error.message : "Failed to setup variants",
            })
            setIsProcessing(false)
        }
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Perfume Auto-Setup</Heading>
            </div>
            <div className="px-6 py-4 space-y-6">

                {!loadingAssets && volumeCount !== null && (
                    <div className="bg-ui-bg-subtle border border-ui-border-base rounded-lg p-3">
                        <Text className="text-sm font-medium mb-1">
                            Bottle Library Status:
                        </Text>
                        <Text className="text-xs text-ui-fg-subtle">
                            {bottleCount && bottleCount > 0
                                ? `Found ${bottleCount} specific bottle configurations spread across ${volumeCount} volume sizes.`
                                : "No bottles configured in the library. Please go to Bottle Assets settings to add them."}
                        </Text>
                    </div>
                )}

                <div>
                    <Label htmlFor="price-per-ml" className="mb-2">Price per mL (BDT)</Label>
                    <Input
                        id="price-per-ml"
                        type="number"
                        step="0.01"
                        placeholder="5.00"
                        value={pricePerMl}
                        onChange={(e) => setPricePerMl(e.target.value)}
                        disabled={isProcessing || bottleCount === 0}
                    />
                </div>

                <div className="pt-2">
                    <Button
                        onClick={handleAutoSetup}
                        disabled={isProcessing || bottleCount === 0 || !pricePerMl}
                        variant="primary"
                        className="w-full"
                    >
                        {isProcessing ? "Processing..." : "Generate Variants"}
                    </Button>
                    <p className="text-xs text-red-500 mt-2 text-center">
                        ⚠️ This will replace all existing options and variants
                    </p>
                </div>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product.details.side.after",
})

export default PerfumeVariantSetupWidget
