import { retrieveOrder } from "@lib/data/orders"
import { retrieveCustomer } from "@lib/data/customer"
import OrderDetailsTemplate from "@modules/order/templates/order-details-template"
import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

// Always fetch fresh — so metadata.custom_status is never stale
export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    notFound()
  }

  return {
    title: `Order #${order.display_id}`,
    description: `View your order`,
  }
}

export default async function OrderDetailPage(props: Props) {
  const params = await props.params
  const [order, customer] = await Promise.all([
    retrieveOrder(params.id).catch(() => null),
    retrieveCustomer().catch(() => null),
  ])

  if (!order) {
    redirect("/account")
  }

  return (
    <OrderDetailsTemplate
      order={order}
      customer={
        customer
          ? {
              first_name: customer.first_name ?? undefined,
              last_name: customer.last_name ?? undefined,
              email: customer.email,
            }
          : null
      }
    />
  )
}
