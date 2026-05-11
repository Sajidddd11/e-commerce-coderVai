import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PERFUME_ASSET_MODULE } from "../../../../modules/perfume-asset"

export async function DELETE(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const perfumeAssetModuleService = req.scope.resolve(PERFUME_ASSET_MODULE) as any

    await perfumeAssetModuleService.deletePerfumeBottles(req.params.id)

    res.json({
        id: req.params.id,
        object: "perfume_bottle",
        deleted: true,
    })
}

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const perfumeAssetModuleService = req.scope.resolve(PERFUME_ASSET_MODULE) as any

    const updateData = req.body as {
        name?: string
        base_price?: number
        image_url?: string
    }

    const updated = await perfumeAssetModuleService.updatePerfumeBottles({
        id: req.params.id,
        ...updateData,
    })

    res.json({
        perfume_bottle: updated,
    })
}
