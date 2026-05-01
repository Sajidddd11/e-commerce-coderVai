import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const query = req.scope.resolve("query")

    // Use Medusa Query to fetch volumes & nested bottles
    const { data: perfume_volumes } = await query.graph({
        entity: "perfume_volume",
        fields: ["id", "volume_ml", "bottles.*"],
    })

    // Sort them numerically by volume
    perfume_volumes.sort((a: any, b: any) => a.volume_ml - b.volume_ml)

    // Sort bottles by name
    for (const vol of perfume_volumes) {
        if (vol.bottles) {
            vol.bottles.sort((a: any, b: any) => a.name.localeCompare(b.name))
        }
    }

    res.json({
        perfume_volumes,
    })
}
