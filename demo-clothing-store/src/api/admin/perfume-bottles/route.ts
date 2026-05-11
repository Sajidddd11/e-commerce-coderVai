import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PERFUME_ASSET_MODULE } from "../../../modules/perfume-asset"

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const perfumeAssetModuleService = req.scope.resolve(PERFUME_ASSET_MODULE) as any

    // Cast the request body from 'unknown' to match what createPerfumeBottles expects
    const body = req.body as {
        volume_id: string
        name: string
        base_price: number
        image_url: string
    }

    const bottle = await perfumeAssetModuleService.createPerfumeBottles(body)

    res.json({
        perfume_bottle: bottle,
    })
}
