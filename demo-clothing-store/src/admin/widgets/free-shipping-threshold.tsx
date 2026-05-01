
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Label, Text, toast, Badge } from "@medusajs/ui"
import { useState, useEffect } from "react"
import { CurrencyDollar } from "@medusajs/icons"

type PromotionRule = {
    id: string
    attribute: string
    operator: string
    values: { value: string }[] | string[]
}

type Promotion = {
    id: string
    code: string
    rules: PromotionRule[]
}

const FreeShippingThresholdWidget = ({ data }: { data: any }) => {
    const [promotion, setPromotion] = useState<Promotion | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [threshold, setThreshold] = useState("")
    const [targetRuleId, setTargetRuleId] = useState<string | null>(null)

    const promotionId = data?.id

    useEffect(() => {
        if (promotionId) {
            fetchPromotion()
        }
    }, [promotionId])

    const fetchPromotion = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/admin/promotions/${promotionId}`, {
                credentials: "include",
            })
            const result = await response.json()

            if (result.promotion) {
                setPromotion(result.promotion)
                findThresholdRule(result.promotion)
            }
        } catch (error) {
            console.error("Error fetching promotion:", error)
            toast.error("Error", {
                description: "Failed to load promotion details",
            })
        } finally {
            setLoading(false)
        }
    }

    const findThresholdRule = (promo: Promotion) => {
        // Look for a rule with attribute 'item_total'
        const rule = promo.rules?.find(r => r.attribute === "item_total")

        if (rule) {
            setTargetRuleId(rule.id)
            // Handle both object array and string array structure for values
            const val = rule.values?.[0]
            if (typeof val === 'object' && val !== null && 'value' in val) {
                setThreshold(val.value)
            } else if (typeof val === 'string') {
                setThreshold(val)
            }
        }
    }

    const handleSave = async () => {
        if (!targetRuleId || !threshold) return

        try {
            setUpdating(true)

            // Construct the update payload
            // We only need to send the rule we want to update
            // However, the API might require specific structure
            // In Medusa v2, we often use workflows, but for simple updates via Admin API:

            const payload = {
                update: [
                    {
                        id: targetRuleId,
                        values: [threshold]
                    }
                ]
            }

            const response = await fetch(`/admin/promotions/${promotionId}/rules/batch`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(payload),
            })

            const result = await response.json()

            if (response.ok) {
                toast.success("Success", {
                    description: "Shipping threshold updated successfully",
                })
                fetchPromotion() // Refresh data
            } else {
                throw new Error(result.message || "Update failed")
            }

        } catch (error) {
            console.error("Error updating threshold:", error)
            toast.error("Error", {
                description: error instanceof Error ? error.message : "Failed to update threshold",
            })
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <Container className="p-6">
                <Text className="text-ui-fg-subtle">Loading promotion details...</Text>
            </Container>
        )
    }

    // If no generic item_total rule is found, we don't show the widget content or show a message
    if (!targetRuleId) {
        // Only show message if this is the specific promotion requested, otherwise hide to avoid clutter
        if (promotion?.id === "promo_01KHK16KEYGNHMMB3D285VAX5N") {
            return (
                <Container className="p-6">
                    <Text className="text-ui-fg-subtle">No item_total threshold rule found in this promotion.</Text>
                </Container>
            )
        }
        return null
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                    <CurrencyDollar className="text-ui-fg-subtle" />
                    <Heading level="h2">Free Shipping Threshold</Heading>
                </div>
                <Badge color="green">Active</Badge>
            </div>

            <div className="px-6 py-4 space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="threshold-input">
                        Minimum Order Value (BDT)
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            id="threshold-input"
                            type="number"
                            placeholder="3000"
                            value={threshold}
                            onChange={(e) => setThreshold(e.target.value)}
                        />
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            isLoading={updating}
                            disabled={!threshold}
                        >
                            Save
                        </Button>
                    </div>
                    <Text size="small" className="text-ui-fg-subtle">
                        Orders equal to or above this amount will receive free shipping.
                    </Text>
                </div>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "promotion.details.after",
})

export default FreeShippingThresholdWidget
