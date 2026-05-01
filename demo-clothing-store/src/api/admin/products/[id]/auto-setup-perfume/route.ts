import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
// Use query graph instead of service directly so we can easily fetch the nested bottles

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const productId = req.params.id
    const { price_per_ml } = req.body as {
        price_per_ml: number
    }

    try {
        if (!price_per_ml || price_per_ml < 0) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "Missing or invalid required field: price_per_ml"
            )
        }

        const query = req.scope.resolve("query")

        // Fetch product, region, and nested perfume volumes+bottles in parallel
        const [
            { data: products },
            { data: regions },
            { data: perfumeVolumes }
        ] = await Promise.all([
            query.graph({
                entity: "product",
                fields: ["id", "title", "options.*", "variants.*", "metadata"],
                filters: { id: productId },
            }),
            query.graph({
                entity: "region",
                fields: ["id", "currency_code"],
            }),
            query.graph({
                entity: "perfume_volume",
                fields: ["id", "volume_ml", "bottles.*"],
            })
        ])

        const product = products?.[0]
        const defaultRegion = regions?.[0]

        if (!product) {
            throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product not found")
        }

        if (!defaultRegion) {
            throw new MedusaError(MedusaError.Types.NOT_FOUND, "No region found for pricing")
        }

        const volumesWithBottles = perfumeVolumes?.filter((v: any) => v.bottles && v.bottles.length > 0)

        if (!volumesWithBottles || volumesWithBottles.length === 0) {
            throw new MedusaError(MedusaError.Types.INVALID_DATA, "No completely configured bottles found in the library")
        }

        // Respond immediately
        res.json({
            message: "Setup started in background",
            status: "processing",
            product_id: productId,
        })

            // Continue processing in background
            ; (async () => {
                try {
                    // Parallel deletion
                    const deletionPromises: Promise<any>[] = []

                    if (product.variants && product.variants.length > 0) {
                        const { deleteProductVariantsWorkflow } = await import(
                            "@medusajs/core-flows"
                        )
                        deletionPromises.push(
                            deleteProductVariantsWorkflow(req.scope).run({
                                input: { ids: product.variants.map((v: any) => v.id) },
                            })
                        )
                    }

                    if (product.options && product.options.length > 0) {
                        const { deleteProductOptionsWorkflow } = await import(
                            "@medusajs/core-flows"
                        )
                        deletionPromises.push(
                            deleteProductOptionsWorkflow(req.scope).run({
                                input: { ids: product.options.map((o: any) => o.id) },
                            })
                        )
                    }

                    if (deletionPromises.length > 0) {
                        await Promise.all(deletionPromises)
                    }

                    // Update product metadata with price_per_ml
                    const { updateProductsWorkflow } = await import(
                        "@medusajs/core-flows"
                    )

                    await updateProductsWorkflow(req.scope).run({
                        input: {
                            products: [
                                {
                                    id: productId,
                                    metadata: {
                                        ...product.metadata,
                                        price_per_ml: price_per_ml,
                                    },
                                },
                            ],
                        },
                    })

                    // Collect unique volumes that actually have bottles
                    const uniqueVolumes = volumesWithBottles.map((v: any) => v.volume_ml).sort((a: any, b: any) => a - b)
                    const volumeStrings = uniqueVolumes.map((v: any) => `${v}mL`)

                    // Collect all bottle names across all volumes
                    const uniqueBottleNames = Array.from(
                        new Set(volumesWithBottles.flatMap((v: any) => v.bottles.map((b: any) => b.name)))
                    ).sort()

                    // Create Volume and Bottle options
                    const { createProductOptionsWorkflow } = await import(
                        "@medusajs/core-flows"
                    )

                    const optionsResult = await createProductOptionsWorkflow(req.scope).run({
                        input: {
                            product_options: [
                                {
                                    product_id: productId,
                                    title: "Volume",
                                    values: volumeStrings,
                                },
                                {
                                    product_id: productId,
                                    title: "Bottle",
                                    values: uniqueBottleNames as string[],
                                },
                            ],
                        },
                    })

                    const createdOptions = optionsResult.result || []
                    const volumeOption = createdOptions.find((o: any) => o.title === "Volume")
                    const bottleOption = createdOptions.find((o: any) => o.title === "Bottle")

                    if (!volumeOption || !bottleOption) {
                        throw new Error("Failed to create product options")
                    }

                    // Create variants based on the hierarchy
                    const variantsToCreate: any[] = []
                    let variantCounter = 0

                    for (const vol of volumesWithBottles) {
                        const volumeStr = `${vol.volume_ml}mL`
                        const perfumePrice = vol.volume_ml * price_per_ml

                        // Sort bottles by name to ensure consistent ordering
                        const sortedBottles = vol.bottles.sort((a: any, b: any) => a.name.localeCompare(b.name))

                        for (const bottle of sortedBottles) {
                            if (!bottle) continue

                            const totalPrice = perfumePrice + (bottle.base_price || 0)
                            variantCounter++

                            variantsToCreate.push({
                                product_id: productId,
                                title: `${volumeStr} - ${bottle.name || 'Unknown'}`,
                                sku: `PERF-${vol.volume_ml}-${(bottle.name || 'Bottle').replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}-${variantCounter}`,
                                manage_inventory: false,
                                options: {
                                    [volumeOption.title]: volumeStr,
                                    [bottleOption.title]: bottle.name || 'Unknown',
                                },
                                prices: [
                                    {
                                        amount: Math.round(totalPrice),
                                        currency_code: defaultRegion.currency_code,
                                    },
                                ],
                                metadata: {
                                    bottle_asset_id: bottle.id,
                                    image_url: bottle.image_url,
                                    base_price: bottle.base_price || 0,
                                }
                            })
                        }
                    }

                    // Create all variants
                    const { createProductVariantsWorkflow } = await import(
                        "@medusajs/core-flows"
                    )

                    await createProductVariantsWorkflow(req.scope).run({
                        input: {
                            product_variants: variantsToCreate,
                        },
                    })

                    console.log(`✅ Successfully created ${variantsToCreate.length} variants for product ${productId} from hierarchical Bottle Library`)
                } catch (error) {
                    console.error("Error in background auto-setup:", error)
                }
            })()

    } catch (error) {
        console.error("Error in auto-setup-perfume:", error)
        res.status(500).json({
            message: "Failed to setup perfume product",
            error: error instanceof Error ? error.message : "Unknown error",
        })
    }
}
