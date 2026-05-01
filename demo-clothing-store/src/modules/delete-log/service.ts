import { MedusaService } from "@medusajs/framework/utils"
import DeleteLog from "./models/delete-log"

class DeleteLogModuleService extends MedusaService({
    DeleteLog,
}) { }

export default DeleteLogModuleService
