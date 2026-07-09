import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import { redirect } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import { Pagination } from "@modules/store/components/pagination"

// Always fetch fresh — so metadata.custom_status is never stale
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

type Props = {
  searchParams: Promise<{ page?: string }>
}

export default async function Orders(props: Props) {
  const searchParams = await props.searchParams
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1
  const limit = 5
  const offset = (currentPage - 1) * limit

  const ordersRes = await listOrders(limit, offset).catch(() => null)

  if (!ordersRes) {
    redirect("/account")
  }

  const { orders, count } = ordersRes
  const totalPages = Math.ceil((count ?? 0) / limit)

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Orders</h1>
        <p className="text-base-regular">
          View your previous orders and their status. You can also create
          returns or exchanges for your orders if needed.
        </p>
      </div>
      <div>
        <OrderOverview orders={orders} />
        {totalPages > 1 && (
          <Pagination page={currentPage} totalPages={totalPages} />
        )}
      </div>
    </div>
  )
}
