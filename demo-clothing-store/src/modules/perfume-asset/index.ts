import { Module } from "@medusajs/framework/utils"
import PerfumeAssetModuleService from "./service"

export const PERFUME_ASSET_MODULE = "perfumeAssetModuleService"

export default Module(PERFUME_ASSET_MODULE, {
    service: PerfumeAssetModuleService,
})
