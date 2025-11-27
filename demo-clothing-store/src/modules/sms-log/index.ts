import { Module } from "@medusajs/framework/utils"
import SmsLogModuleService from "./service"

export const SMS_LOG_MODULE = "smsLogModuleService"

export default Module(SMS_LOG_MODULE, {
  service: SmsLogModuleService,
})

