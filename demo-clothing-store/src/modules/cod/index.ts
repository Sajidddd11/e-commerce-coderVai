import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { CodPaymentProvider } from "./services/payment-provider"

export default ModuleProvider(Modules.PAYMENT, {
  services: [CodPaymentProvider],
})
