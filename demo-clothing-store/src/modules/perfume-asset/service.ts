import { MedusaService } from "@medusajs/framework/utils"
import { PerfumeVolume, PerfumeBottle } from "./models/perfume-asset"

class PerfumeAssetModuleService extends MedusaService({
    PerfumeVolume,
    PerfumeBottle,
}) { }

export default PerfumeAssetModuleService
