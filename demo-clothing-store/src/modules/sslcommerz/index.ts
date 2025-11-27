import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { SSLCommerzPaymentProvider } from "./services/payment-provider"

export default ModuleProvider(Modules.PAYMENT, {
  services: [SSLCommerzPaymentProvider],
})
