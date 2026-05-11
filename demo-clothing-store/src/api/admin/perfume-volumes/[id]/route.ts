import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PERFUME_ASSET_MODULE } from "../../../../modules/perfume-asset"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const query = req.scope.resolve("query")

    const { data: perfume_volumes } = await query.graph({
        entity: "perfume_volume",
        fields: ["id", "volume_ml", "bottles.*"],
        filters: {
            id: req.params.id
        }
    })

    res.json({
        perfume_volume: perfume_volumes[0],
    })
}

export async function DELETE(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const perfumeAssetModuleService = req.scope.resolve(PERFUME_ASSET_MODULE) as any

    // Medusa usually handles cascade if setup, or we must delete bottles first.
    // To be safe, we just delete the volume. It's better to manage manually but V2 handles basic relations.
    const bottles = await perfumeAssetModuleService.listPerfumeBottles({
        volume: { id: req.params.id }
    })

    if (bottles.length > 0) {
        for (const b of bottles) {
            await perfumeAssetModuleService.deletePerfumeBottles(b.id)
        }
    }

    await perfumeAssetModuleService.deletePerfumeVolumes(req.params.id)

    res.json({
        id: req.params.id,
        object: "perfume_volume",
        deleted: true,
    })
}
