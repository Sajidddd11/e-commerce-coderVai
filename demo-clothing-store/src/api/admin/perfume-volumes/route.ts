import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PERFUME_ASSET_MODULE } from "../../../modules/perfume-asset"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const query = req.scope.resolve("query")

    const { data: perfume_volumes } = await query.graph({
        entity: "perfume_volume",
        fields: ["id", "volume_ml", "bottles.*"],
    })

    // Sort them numerically
    perfume_volumes.sort((a: any, b: any) => a.volume_ml - b.volume_ml)

    res.json({
        perfume_volumes,
    })
}

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const perfumeAssetModuleService = req.scope.resolve(PERFUME_ASSET_MODULE) as any

    const body = req.body as { volume_ml: number }

    // Ensure volume doesn't already exist (simple check)
    const existing = await perfumeAssetModuleService.listPerfumeVolumes({
        volume_ml: body.volume_ml
    })

    if (existing.length > 0) {
        res.status(400).json({ message: "Volume already exists" })
        return
    }

    const volume = await perfumeAssetModuleService.createPerfumeVolumes(body)

    res.json({
        perfume_volume: volume,
    })
}
