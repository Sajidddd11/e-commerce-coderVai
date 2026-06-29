import { MedusaService } from "@medusajs/framework/utils"
import AppHeroSlide from "./models/app-hero-slide"

class AppHeroModuleService extends MedusaService({
    AppHeroSlide,
}) { }

export default AppHeroModuleService
