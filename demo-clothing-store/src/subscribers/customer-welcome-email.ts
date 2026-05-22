// ---------------------------------------------------------------------------
// Subscriber: Welcome email on customer.created
// Medusa fires this event whenever a new customer account is created
// ---------------------------------------------------------------------------

import { ICustomerModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { sendWelcomeEmail } from "../lib/email"

export default async function customerCreatedSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const customerId = data.id

  try {
    const customerService: ICustomerModuleService = container.resolve(
      Modules.CUSTOMER
    )

    const customer = await customerService.retrieveCustomer(customerId, {
      select: ["id", "email", "first_name", "last_name"],
    })

    if (!customer?.email) {
      logger.warn(`[Brevo] customer.created: no email for customer ${customerId}`)
      return
    }

    const name =
      [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
      "there"

    logger.info(`[Brevo] Sending welcome email to ${customer.email}`)

    const result = await sendWelcomeEmail({
      to: customer.email,
      name,
    })

    if (result.success) {
      logger.info(`[Brevo] Welcome email sent to ${customer.email} (messageId: ${result.messageId})`)
    } else {
      logger.warn(`[Brevo] Failed to send welcome email to ${customer.email}: ${result.error}`)
    }
  } catch (err: any) {
    logger.error(`[Brevo] customer.created subscriber error: ${err?.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
