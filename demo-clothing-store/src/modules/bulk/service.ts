import { MedusaService } from "@medusajs/framework/utils"
import BulkProduct from "./models/bulk-product"

class BulkModuleService extends MedusaService({
    BulkProduct,
}) { }

export default BulkModuleService
