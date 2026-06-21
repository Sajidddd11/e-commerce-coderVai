import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Badge, Text, Copy } from "@medusajs/ui"
import { useState, useEffect } from "react"
import { BuildingStorefront, TruckFast, MapPin, Clock, ArrowPath } from "@medusajs/icons"

const CourierShipmentWidget = ({ data }: { data: any }) => {
    const [shipments, setShipments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [tracking, setTracking] = useState(false)
    const [activeProvider, setActiveProvider] = useState<string | null>(null)

    const orderId = data?.id

    useEffect(() => {
        if (orderId) {
            fetchShipments()
            fetchActiveProvider()
        }
    }, [orderId])

    const fetchActiveProvider = async () => {
        try {
            const res = await fetch("/admin/courier/active", { credentials: "include" })
            const result = await res.json()
            setActiveProvider(result.provider ?? null)
        } catch {
            // silently ignore
        }
    }

    const fetchShipments = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/admin/courier/shipment/${orderId}`, {
                credentials: "include",
            })
            const result = await response.json()
            setShipments(result.shipments || [])
        } catch (error) {
            console.error("Error fetching shipments:", error)
        } finally {
            setLoading(false)
        }
    }

    const createShipment = async () => {
        if (!activeProvider) {
            alert("No active courier configured. Please go to Courier Settings and activate a provider.")
            return
        }
        try {
            setCreating(true)
            const response = await fetch("/admin/courier/shipment", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    order_id: orderId,
                    provider: activeProvider,
                    delivery_type: 48,
                    item_type: 2,
                    item_weight: 0.5,
                }),
            })

            const result = await response.json()

            if (result.success) {
                alert("Shipment created successfully!")
                fetchShipments()
            } else {
                const errorMsg = result.message || "Failed to create shipment"
                const errorDetails = result.details ? `\n\nDetails:\n${JSON.stringify(result.details, null, 2)}` : ""
                alert(`${errorMsg}${errorDetails}`)
                console.error("Shipment creation error:", result)
            }
        } catch (error: any) {
            console.error("Error creating shipment:", error)
            alert(`Error: ${error.message}`)
        } finally {
            setCreating(false)
        }
    }

    const trackShipment = async (shipmentId: string) => {
        try {
            setTracking(true)
            const response = await fetch(`/admin/courier/shipment/${shipmentId}/track`, {
                credentials: "include",
            })

            const result = await response.json()

            if (result.success) {
                alert("Tracking updated successfully!")
                fetchShipments()
            } else {
                alert(`Failed to track shipment: ${result.message}`)
            }
        } catch (error: any) {
            console.error("Error tracking shipment:", error)
            alert(`Error: ${error.message}`)
        } finally {
            setTracking(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "created":
            case "pending":
                return "blue"
            case "shipped":
                return "purple"
            case "delivered":
                return "green"
            case "failed":
            case "canceled":
                return "red"
            default:
                return "grey"
        }
    }

    if (loading) {
        return (
            <Container className="divide-y p-0">
                <div className="flex items-center justify-between px-6 py-4">
                    <Heading level="h2">Courier Shipment</Heading>
                </div>
                <div className="px-6 py-4">
                    <Text className="text-ui-fg-subtle">Loading...</Text>
                </div>
            </Container>
        )
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                    <BuildingStorefront className="text-ui-fg-subtle" />
                    <Heading level="h2">Courier Shipment</Heading>
                </div>
                {shipments.length === 0 && (
                    <Button
                        size="small"
                        variant="secondary"
                        onClick={createShipment}
                        isLoading={creating}
                        disabled={!activeProvider}
                        title={!activeProvider ? "No active courier configured" : undefined}
                    >
                        Create Shipment
                    </Button>
                )}
            </div>

            <div className="px-6 py-4">
                {shipments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <TruckFast className="text-ui-fg-muted mb-4" />
                        <Text className="text-ui-fg-subtle mb-2">No shipment created yet</Text>
                        <Text size="small" className="text-ui-fg-muted">
                            Create a courier shipment to start tracking delivery
                        </Text>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {shipments.map((shipment) => (
                            <div
                                key={shipment.id}
                                className="rounded-lg border border-ui-border-base p-4 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge color={getStatusColor(shipment.status)}>
                                            {shipment.status?.toUpperCase()}
                                        </Badge>
                                        <Text weight="plus" size="small" className="uppercase">
                                            {shipment.provider}
                                        </Text>
                                    </div>
                                    <Button
                                        size="small"
                                        variant="transparent"
                                        onClick={() => trackShipment(shipment.id)}
                                        isLoading={tracking}
                                    >
                                        <ArrowPath className="mr-1" />
                                        Update Status
                                    </Button>
                                </div>

                                {shipment.consignment_id && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="text-ui-fg-subtle" />
                                        <Text size="small" className="text-ui-fg-subtle">
                                            Tracking ID:
                                        </Text>
                                        <Copy content={shipment.consignment_id} className="text-ui-fg-base">
                                            {shipment.consignment_id}
                                        </Copy>
                                    </div>
                                )}

                                {shipment.delivery_fee && (
                                    <div className="flex items-center gap-2">
                                        <Text size="small" className="text-ui-fg-subtle">
                                            Delivery Fee:
                                        </Text>
                                        <Text size="small" weight="plus">
                                            ৳{shipment.delivery_fee}
                                        </Text>
                                    </div>
                                )}

                                {shipment.tracking_data?.order_status && (
                                    <div className="flex items-center gap-2">
                                        <TruckFast className="text-ui-fg-subtle" />
                                        <Text size="small" className="text-ui-fg-subtle">
                                            Order Status:
                                        </Text>
                                        <Text size="small">{shipment.tracking_data.order_status}</Text>
                                    </div>
                                )}

                                {shipment.tracking_data?.updated_at && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="text-ui-fg-subtle" />
                                        <Text size="small" className="text-ui-fg-subtle">
                                            Last Updated:
                                        </Text>
                                        <Text size="small">
                                            {new Date(shipment.tracking_data.updated_at).toLocaleString()}
                                        </Text>
                                    </div>
                                )}

                                {shipment.error_message && (
                                    <div className="rounded bg-ui-bg-error-subtle p-3">
                                        <Text size="small" className="text-ui-fg-error">
                                            Error: {shipment.error_message}
                                        </Text>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "order.details.after",
})

export default CourierShipmentWidget
