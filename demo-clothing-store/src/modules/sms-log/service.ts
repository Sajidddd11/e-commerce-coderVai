import { MedusaService } from "@medusajs/framework/utils"
import SmsLog from "./models/sms-log"

class SmsLogModuleService extends MedusaService({
  SmsLog,
}) {}

export default SmsLogModuleService

