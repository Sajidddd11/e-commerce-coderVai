import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const customerId = (req as any).auth_context?.actor_id
  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const { email } = req.body as { email: string }
  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Invalid email address" })
  }

  try {
    const customerModuleService = req.scope.resolve(Modules.CUSTOMER)

    // Check if the email is already in use by another customer
    const existing = await customerModuleService.listCustomers({ email })
    if (existing.length > 0 && existing[0].id !== customerId) {
      return res.status(400).json({ message: "Email is already in use by another account." })
    }

    // Update the customer record's email
    const updated = await customerModuleService.updateCustomers(customerId, {
      email,
    })

    return res.status(200).json({ success: true, customer: updated })
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to update email." })
  }
}
