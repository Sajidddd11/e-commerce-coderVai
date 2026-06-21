import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { PathaoService } from "~/lib/pathao-service"
import { SteadfastService } from "~/lib/steadfast-service"

/**
 * POST /admin/courier/shipment
 * Create a shipment for an order
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const orderModuleService = req.scope.resolve(Modules.ORDER)
    const remoteQuery = req.scope.resolve("remoteQuery")

    const {
        order_id,
        provider,
        store_id,
        delivery_type = 48,
        item_type = 2,
        item_weight = 0.5,
        special_instruction
    } = req.body as {
        order_id: string
        provider: string
        store_id?: number
        delivery_type?: 48 | 12
        item_type?: 1 | 2
        item_weight?: number
        special_instruction?: string
    }

    if (!order_id || !provider) {
        return res.status(400).json({
            message: 'order_id and provider are required'
        })
    }

    try {
        // Get courier config
        const courierConfig = await pgConnection('courier_config')
            .where('provider', provider)
            .where('is_active', true)
            .first()

        if (!courierConfig) {
            return res.status(404).json({
                message: `No active configuration found for provider '${provider}'`
            })
        }

        const config = typeof courierConfig.config === 'string'
            ? JSON.parse(courierConfig.config)
            : courierConfig.config

        // Get order details with shipping address and payment info
        const orderData = await remoteQuery({
            entryPoint: "order",
            fields: [
                "id",
                "display_id",
                "email",
                "total",
                "currency_code",
                "shipping_address.*",
                "items.*",
                "payment_collections.*",
                "payment_collections.payments.*"
            ],
            variables: { filters: { id: order_id } },
        })

        if (!orderData || orderData.length === 0) {
            return res.status(404).json({
                message: 'Order not found'
            })
        }

        const order = orderData[0]
        const shippingAddress = order.shipping_address

        if (!shippingAddress) {
            return res.status(400).json({
                message: 'Order has no shipping address'
            })
        }

        // Calculate total quantity and prepare items description
        const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)
        const itemsDescription = order.items
            .map(item => `${item.title} (${item.quantity}x)`)
            .join(', ')

        // Calculate total paid amount to determine COD vs prepaid
        // IMPORTANT: Only count CAPTURED payments, not just authorized
        let totalPaid = 0
        if (order.payment_collections && order.payment_collections.length > 0) {
            for (const collection of order.payment_collections) {
                if (collection.payments && collection.payments.length > 0) {
                    for (const payment of collection.payments) {
                        // Only count payments that have been CAPTURED (money actually taken)
                        // Authorized payments don't mean the customer has paid yet
                        if (payment.captured_at) {
                            totalPaid += payment.amount || 0
                        }
                    }
                }
            }
        }

        // Calculate amount to collect from customer
        // If order is fully paid (prepaid), amount_to_collect = 0
        // If order is unpaid or partially paid (COD), amount_to_collect = remaining amount
        // NOTE: Medusa stores amounts in BDT (not paisa), so no need to divide by 100
        const orderTotal = Number(order.total) || 0
        const amountPending = orderTotal - totalPaid
        const amountToCollectBDT = Math.max(0, Math.round(amountPending))

        console.log('💰 Payment Info:')
        console.log('   - Order Total:', orderTotal, 'BDT')
        console.log('   - Total Paid:', totalPaid, 'BDT')
        console.log('   - Amount Pending:', amountPending, 'BDT')
        console.log('   - Amount to Collect:', amountToCollectBDT, 'BDT')
        console.log('   - Payment Type:', amountToCollectBDT > 0 ? 'COD' : 'Prepaid')

        if (provider === 'pathao') {
            const pathaoService = new PathaoService(config, pgConnection)

            // Get default store if not provided
            let pathaoStoreId = store_id
            if (!pathaoStoreId) {
                const defaultStore = await pgConnection('pathao_store')
                    .where('is_default', true)
                    .where('is_active', true)
                    .first()

                if (!defaultStore) {
                    return res.status(400).json({
                        message: 'No default Pathao store configured. Please provide store_id or configure a default store.'
                    })
                }

                pathaoStoreId = defaultStore.store_id
            }


            // Format phone number for Pathao (must be 11 digits without +88)
            let formattedPhone = shippingAddress.phone || ''
            formattedPhone = formattedPhone.replace(/\D/g, '') // Remove all non-digits
            if (formattedPhone.startsWith('88')) {
                formattedPhone = formattedPhone.substring(2) // Remove country code
            }
            if (formattedPhone.startsWith('0') && formattedPhone.length === 11) {
                // Valid format: 01XXXXXXXXX
            } else if (formattedPhone.length === 10 && !formattedPhone.startsWith('0')) {
                // Add leading 0 if missing: 1XXXXXXXXX -> 01XXXXXXXXX
                formattedPhone = '0' + formattedPhone
            }

            // Prepare order request
            const orderRequest = {
                store_id: pathaoStoreId as number,
                merchant_order_id: order.display_id.toString(),
                recipient_name: shippingAddress.first_name + ' ' + (shippingAddress.last_name || ''),
                recipient_phone: formattedPhone,
                recipient_address: [
                    shippingAddress.address_1,
                    shippingAddress.address_2,
                    shippingAddress.city,
                    shippingAddress.postal_code
                ].filter(Boolean).join(', '),
                delivery_type,
                item_type,
                special_instruction: special_instruction || '',
                item_quantity: totalQuantity,
                item_weight,
                item_description: itemsDescription,
                amount_to_collect: amountToCollectBDT // 0 for prepaid, pending amount for COD
            }

            // Create shipment in Pathao
            const pathaoResponse = await pathaoService.createOrder(orderRequest)

            // Save shipment record
            const shipmentId = `ship_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`.toUpperCase()
            const now = new Date()

            await pgConnection('courier_shipment').insert({
                id: shipmentId,
                order_id,
                provider,
                consignment_id: pathaoResponse.consignment_id,
                merchant_order_id: order.display_id.toString(),
                status: 'created',
                delivery_fee: pathaoResponse.delivery_fee,
                tracking_data: JSON.stringify({
                    order_status: pathaoResponse.order_status,
                    consignment_id: pathaoResponse.consignment_id
                }),
                request_payload: JSON.stringify(orderRequest),
                response_payload: JSON.stringify(pathaoResponse),
                created_at: now,
                updated_at: now
            })

            // Update order metadata with shipment info
            await orderModuleService.updateOrders(order_id, {
                metadata: {
                    ...order.metadata,
                    courier_provider: provider,
                    courier_consignment_id: pathaoResponse.consignment_id,
                    courier_shipment_id: shipmentId,
                    courier_delivery_fee: pathaoResponse.delivery_fee
                }
            })

            console.log('✅ Shipment created in Pathao:', pathaoResponse.consignment_id)
            console.log('💾 Saving shipment to database with ID:', shipmentId)
            console.log('📦 Order ID:', order_id, 'Provider:', provider)

            // Verify the insert worked
            const verifyShipment = await pgConnection('courier_shipment')
                .where('id', shipmentId)
                .first()

            console.log('🔍 Verification - Shipment found in DB:', verifyShipment ? 'YES' : 'NO')
            if (verifyShipment) {
                console.log('   - Consignment ID:', verifyShipment.consignment_id)
                console.log('   - Order ID:', verifyShipment.order_id)
            }

            return res.json({
                success: true,
                message: 'Shipment created successfully',
                shipment: {
                    id: shipmentId,
                    provider: provider,
                    status: 'created',
                    consignment_id: pathaoResponse.consignment_id,
                    order_status: pathaoResponse.order_status,
                    delivery_fee: pathaoResponse.delivery_fee,
                    order_id: order_id
                }
            })
        } else if (provider === 'steadfast') {
            const steadfastService = new SteadfastService(config)

            // Format phone for Steadfast (11-digit Bangladeshi number)
            let formattedPhone = shippingAddress.phone || ''
            formattedPhone = formattedPhone.replace(/\D/g, '')
            if (formattedPhone.startsWith('88')) {
                formattedPhone = formattedPhone.substring(2)
            }
            if (formattedPhone.length === 10 && !formattedPhone.startsWith('0')) {
                formattedPhone = '0' + formattedPhone
            }

            const orderRequest = {
                invoice: order.display_id.toString(),
                recipient_name: shippingAddress.first_name + ' ' + (shippingAddress.last_name || ''),
                recipient_phone: formattedPhone,
                recipient_address: [
                    shippingAddress.address_1,
                    shippingAddress.address_2,
                    shippingAddress.city,
                    shippingAddress.postal_code
                ].filter(Boolean).join(', '),
                cod_amount: amountToCollectBDT,
                note: special_instruction || '',
                item_description: itemsDescription,
            }

            const steadfastResponse = await steadfastService.createOrder(orderRequest)
            const consignment = steadfastResponse.consignment

            // Save shipment record
            const shipmentId = `ship_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`.toUpperCase()
            const now = new Date()

            await pgConnection('courier_shipment').insert({
                id: shipmentId,
                order_id,
                provider,
                consignment_id: consignment.tracking_code, // use tracking_code as our consignment ref
                merchant_order_id: order.display_id.toString(),
                status: 'created',
                tracking_data: JSON.stringify({
                    order_status: consignment.status,
                    consignment_id: consignment.consignment_id,
                    tracking_code: consignment.tracking_code,
                }),
                request_payload: JSON.stringify(orderRequest),
                response_payload: JSON.stringify(steadfastResponse),
                created_at: now,
                updated_at: now,
            })

            // Update order metadata
            await orderModuleService.updateOrders(order_id, {
                metadata: {
                    ...order.metadata,
                    courier_provider: provider,
                    courier_consignment_id: consignment.consignment_id,
                    courier_tracking_code: consignment.tracking_code,
                    courier_shipment_id: shipmentId,
                }
            })

            console.log('✅ Shipment created in Steadfast:', consignment.tracking_code)

            return res.json({
                success: true,
                message: 'Shipment created successfully',
                shipment: {
                    id: shipmentId,
                    provider: provider,
                    status: 'created',
                    consignment_id: consignment.consignment_id,
                    tracking_code: consignment.tracking_code,
                    order_id: order_id,
                }
            })
        } else {
            return res.status(400).json({
                message: `Provider '${provider}' is not supported yet`
            })
        }
    } catch (error: any) {
        console.error('Error creating shipment:', error)
        console.error('Pathao API Error Details:', JSON.stringify(error?.response?.data, null, 2))

        // Try to save failed shipment record
        try {
            const shipmentId = `ship_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`.toUpperCase()
            const now = new Date()

            await pgConnection('courier_shipment').insert({
                id: shipmentId,
                order_id,
                provider,
                status: 'failed',
                error_message: error?.response?.data?.message || error?.message || 'Unknown error',
                response_payload: JSON.stringify(error?.response?.data || {}),
                created_at: now,
                updated_at: now
            })
        } catch (saveError) {
            console.error('Error saving failed shipment:', saveError)
        }

        return res.status(500).json({
            success: false,
            message: error?.response?.data?.message || error?.message || 'Failed to create shipment',
            error: error?.response?.data || error?.message,
            details: error?.response?.data?.errors || null
        })
    }
}

/**
 * GET /admin/courier/shipment/:order_id
 * Get shipment details for an order
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const { order_id } = req.params

    console.log('🔎 GET shipment request - Order ID from params:', order_id)
    console.log('🔎 Full params:', req.params)
    console.log('🔎 Full URL:', req.url)

    try {
        const shipments = await pgConnection('courier_shipment')
            .where('order_id', order_id)
            .orderBy('created_at', 'desc')

        console.log('🔎 Found shipments:', shipments.length)

        // Parse JSON fields
        const safeJsonParse = (value: any) => {
            if (typeof value !== 'string') return value
            try { return JSON.parse(value) } catch { return value }
        }

        const parsedShipments = shipments.map(shipment => ({
            ...shipment,
            tracking_data: safeJsonParse(shipment.tracking_data),
            request_payload: safeJsonParse(shipment.request_payload),
            response_payload: safeJsonParse(shipment.response_payload),
        }))

        return res.json({ shipments: parsedShipments })
    } catch (error: any) {
        console.error('Error fetching shipments:', error)
        return res.status(500).json({
            message: error?.message ?? 'Failed to fetch shipments'
        })
    }
}
