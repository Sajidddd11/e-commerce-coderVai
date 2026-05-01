import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"

const OrderItemDetailsWidget = ({ data }: { data: any }) => {
    const order = data

    if (!order || !order.items || order.items.length === 0) {
        return null
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Order Items Details</Heading>
            </div>
            <div className="px-6 py-4">
                <div className="space-y-4">
                    {order.items.map((item: any) => (
                        <div
                            key={item.id}
                            className="border border-ui-border-base rounded-lg p-4 bg-ui-bg-subtle"
                        >
                            {/* Product Title */}
                            <div className="mb-2">
                                <Text className="text-sm font-semibold text-ui-fg-base">
                                    {item.title}
                                </Text>
                            </div>

                            {/* Variant */}
                            <div className="flex items-start gap-2 mb-1">
                                <Text className="text-xs text-ui-fg-muted min-w-[80px]">
                                    Variant:
                                </Text>
                                <Text className="text-xs text-ui-fg-base">
                                    {item.variant_title || item.subtitle || "N/A"}
                                </Text>
                            </div>

                            {/* SKU */}
                            {item.variant_sku && (
                                <div className="flex items-start gap-2 mb-1">
                                    <Text className="text-xs text-ui-fg-muted min-w-[80px]">
                                        SKU:
                                    </Text>
                                    <Text className="text-xs text-ui-fg-subtle font-mono">
                                        {item.variant_sku}
                                    </Text>
                                </div>
                            )}

                            {/* Quantity & Price */}
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-ui-border-base">
                                <div className="flex items-center gap-2">
                                    <Text className="text-xs text-ui-fg-muted">
                                        Qty:
                                    </Text>
                                    <Text className="text-xs text-ui-fg-base font-medium">
                                        {item.quantity}
                                    </Text>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Text className="text-xs text-ui-fg-muted">
                                        Unit Price:
                                    </Text>
                                    <Text className="text-xs text-ui-fg-base font-medium">
                                        {new Intl.NumberFormat('en-BD', {
                                            style: 'currency',
                                            currency: order.currency_code?.toUpperCase() || 'BDT'
                                        }).format(item.unit_price)}
                                    </Text>
                                </div>
                                <div className="flex items-center gap-2 ml-auto">
                                    <Text className="text-xs text-ui-fg-muted">
                                        Total:
                                    </Text>
                                    <Text className="text-sm text-ui-fg-base font-semibold">
                                        {new Intl.NumberFormat('en-BD', {
                                            style: 'currency',
                                            currency: order.currency_code?.toUpperCase() || 'BDT'
                                        }).format(item.total)}
                                    </Text>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "order.details.after",
})

export default OrderItemDetailsWidget
