import { Module } from "@medusajs/framework/utils"
import CustomerNotificationModuleService from "./service"

export const CUSTOMER_NOTIFICATION_MODULE = "customerNotificationModuleService"

export default Module(CUSTOMER_NOTIFICATION_MODULE, {
  service: CustomerNotificationModuleService,
})
