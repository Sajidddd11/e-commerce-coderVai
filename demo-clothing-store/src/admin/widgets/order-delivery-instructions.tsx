import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"

const OrderDeliveryInstructionsWidget = ({ data }: { data: any }) => {
    const order = data

    const deliveryInstructions = order?.metadata?.delivery_instructions

    if (!deliveryInstructions) {
        return null
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Delivery Instructions</Heading>
            </div>
            <div className="px-6 py-4">
                <Text className="text-sm text-ui-fg-base">
                    {deliveryInstructions}
                </Text>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "order.details.side.after",
})

export default OrderDeliveryInstructionsWidget
