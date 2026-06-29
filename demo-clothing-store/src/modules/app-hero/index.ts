import { Module } from "@medusajs/framework/utils"
import AppHeroModuleService from "./service"

export const APP_HERO_MODULE = "app-hero"

export default Module(APP_HERO_MODULE, {
    service: AppHeroModuleService,
})
