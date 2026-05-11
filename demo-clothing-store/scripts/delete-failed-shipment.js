const { Knex } = require('@medusajs/framework/utils')

async function deleteFailedShipment() {
    const orderId = process.argv[2] || 'order_01KGWNRFT07PJHRS90S94BVEB5'

    console.log(`Deleting failed shipment for order: ${orderId}`)

    const pgConnection = Knex({
        client: 'pg',
        connection: process.env.DATABASE_URL,
    })

    try {
        const deleted = await pgConnection('courier_shipment')
            .where({ order_id: orderId, provider: 'pathao' })
            .delete()

        console.log(`✅ Deleted ${deleted} shipment record(s)`)
    } catch (error) {
        console.error('❌ Error:', error.message)
    } finally {
        await pgConnection.destroy()
    }
}

deleteFailedShipment()
