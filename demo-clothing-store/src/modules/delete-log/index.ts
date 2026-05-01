import { Module } from "@medusajs/framework/utils"
import DeleteLogModuleService from "./service"

export const DELETE_LOG_MODULE = "deleteLogModuleService"

export default Module(DELETE_LOG_MODULE, {
    service: DeleteLogModuleService,
})
