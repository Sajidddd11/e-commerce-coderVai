import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const productId = req.params.id

    try {
        const query = req.scope.resolve("query")

        // Fetch the original product with all its data
        const { data: products } = await query.graph({
            entity: "product",
            fields: [
                "id",
                "title",
                "subtitle",
                "description",
                "handle",
                "is_giftcard",
                "discountable",
                "thumbnail",
                "weight",
                "length",
                "height",
                "width",
                "hs_code",
                "origin_country",
                "mid_code",
                "material",
                "status",
                "type_id",
                "collection_id",
                "options.*",
                "options.values.*",
                "variants.*",
                "variants.options.*",
                "images.*",
                "tags.*",
                "sales_channels.*",
            ],
            filters: { id: productId },
        })

        const originalProduct = products?.[0]

        if (!originalProduct) {
            throw new MedusaError(
                MedusaError.Types.NOT_FOUND,
                "Product not found"
            )
        }

        // Prepare the new product data
        const newProductData: any = {
            title: `${originalProduct.title} (Copy)`,
            subtitle: originalProduct.subtitle,
            description: originalProduct.description,
            handle: `${originalProduct.handle}-copy-${Date.now()}`,
            is_giftcard: originalProduct.is_giftcard,
            discountable: originalProduct.discountable,
            thumbnail: originalProduct.thumbnail,
            weight: originalProduct.weight,
            length: originalProduct.length,
            height: originalProduct.height,
            width: originalProduct.width,
            hs_code: originalProduct.hs_code,
            origin_country: originalProduct.origin_country,
            mid_code: originalProduct.mid_code,
            material: originalProduct.material,
            status: "draft",
        }

        // Add type if exists
        if (originalProduct.type_id) {
            newProductData.type_id = originalProduct.type_id
        }

        // Add collection if exists
        if (originalProduct.collection_id) {
            newProductData.collection_id = originalProduct.collection_id
        }

        // Add sales channels if exists
        if (originalProduct.sales_channels && originalProduct.sales_channels.length > 0) {
            newProductData.sales_channels = originalProduct.sales_channels.map((channel: any) => ({
                id: channel.id
            }))
        }

        // Add tags if exists
        if (originalProduct.tags && originalProduct.tags.length > 0) {
            newProductData.tags = originalProduct.tags.map((tag: any) => ({
                value: tag.value
            }))
        }

        // Add images if exists
        if (originalProduct.images && originalProduct.images.length > 0) {
            newProductData.images = originalProduct.images.map((img: any) => ({
                url: img.url
            }))
        }

        // Add options if exists
        if (originalProduct.options && originalProduct.options.length > 0) {
            newProductData.options = originalProduct.options.map((option: any) => ({
                title: option.title,
                values: option.values?.map((v: any) => v.value) || []
            }))
        }

        // Add variants if exists
        if (originalProduct.variants && originalProduct.variants.length > 0) {
            newProductData.variants = originalProduct.variants.map((variant: any) => {
                const variantData: any = {
                    title: variant.title,
                    sku: variant.sku ? `${variant.sku}-copy-${Date.now()}` : undefined,
                    barcode: variant.barcode,
                    ean: variant.ean,
                    upc: variant.upc,
                    inventory_quantity: variant.inventory_quantity || 0,
                    allow_backorder: variant.allow_backorder,
                    manage_inventory: variant.manage_inventory,
                    weight: variant.weight,
                    length: variant.length,
                    height: variant.height,
                    width: variant.width,
                }

                // Add variant options
                if (variant.options && variant.options.length > 0) {
                    variantData.options = {}
                    variant.options.forEach((opt: any) => {
                        variantData.options[opt.option?.title || ""] = opt.value
                    })
                }

                return variantData
            })
        }

        // Use workflows to create the product
        const { createProductsWorkflow } = await import(
            "@medusajs/core-flows"
        )

        const { result } = await createProductsWorkflow(req.scope).run({
            input: {
                products: [newProductData],
            },
        })

        const newProduct = result[0]

        res.json({
            product: newProduct,
            message: "Product duplicated successfully"
        })
    } catch (error) {
        console.error("Error duplicating product:", error)
        res.status(500).json({
            message: "Failed to duplicate product",
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
}
