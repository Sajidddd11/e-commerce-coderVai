import { Metadata } from "next"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import BulkOrderClient from "./bulk-order-client"

export const metadata: Metadata = {
    title: "Bulk Orders | ZAHAN Fashion and Lifestyle",
    description: "Order in bulk from ZAHAN. Special pricing for large quantities — contact us via WhatsApp for pricing and availability.",
}

type BulkProductRecord = {
    id: string
    product_id: string
    is_active: boolean
    min_quantity: number | null
    notes: string | null
}

type Props = {
    params: Promise<{ countryCode: string }>
}

async function getBulkProductIds(): Promise<BulkProductRecord[]> {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const res = await fetch(`${backendUrl}/store/bulk-products`, {
            next: { revalidate: 60 },
            headers: {
                "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
            },
        })
        if (!res.ok) return []
        const data = await res.json()
        return data.bulk_products || []
    } catch {
        return []
    }
}

async function getBulkSettings() {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const res = await fetch(`${backendUrl}/store/bulk-products/settings`, {
            next: { revalidate: 60 },
            headers: {
                "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
            },
        })
        if (!res.ok) return null
        const data = await res.json()
        return data.settings
    } catch {
        return null
    }
}

export default async function BulkOrderPage({ params }: Props) {
    const { countryCode } = await params
    const region = await getRegion(countryCode)

    if (!region) return null

    const bulkRecords = await getBulkProductIds()
    const bulkSettings = await getBulkSettings()
    const activeBulkRecords = bulkRecords.filter((b) => b.is_active)

    let products: HttpTypes.StoreProduct[] = []

    if (activeBulkRecords.length > 0) {
        // Fetch all products and filter to bulk ones
        // We fetch in batches of IDs
        const productIds = activeBulkRecords.map((b) => b.product_id)

        try {
            const result = await listProducts({
                countryCode,
                queryParams: {
                    id: productIds as any,
                    limit: 100,
                    fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags",
                },
            })
            products = result.response.products
        } catch {
            products = []
        }
    }

    // Build a map from product_id -> bulk record for easy lookup
    const bulkMap = Object.fromEntries(activeBulkRecords.map((b) => [b.product_id, b]))

    // Sort products to match the bulk record order
    const sortedProducts = [...products].sort((a, b) => {
        const aIdx = activeBulkRecords.findIndex((r) => r.product_id === a.id)
        const bIdx = activeBulkRecords.findIndex((r) => r.product_id === b.id)
        return aIdx - bIdx
    })

    return (
        <BulkOrderClient
            products={sortedProducts}
            bulkMap={bulkMap}
            region={region}
            countryCode={countryCode}
            settings={bulkSettings}
        />
    )
}
