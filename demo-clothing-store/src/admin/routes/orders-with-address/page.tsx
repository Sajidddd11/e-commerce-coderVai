import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Table } from "@medusajs/ui"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const OrdersWithAddressPage = () => {
  const navigate = useNavigate()
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch orders with address data
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Use our custom endpoint which properly includes addresses and summary
        const response = await fetch(
          `/admin/orders-with-address?limit=${limit}&offset=${offset}`,
          {
            credentials: "include",
          }
        )

        if (!response.ok) {
          throw new Error("Failed to fetch orders")
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [limit, offset])

  const formatAddress = (address: any) => {
    if (!address) return "N/A"

    // According to schema.sql: order_address has:
    // first_name, last_name, company, address_1, address_2, city, province, postal_code, country_code, phone
    const parts: string[] = []

    // Add name if available
    if (address.first_name || address.last_name) {
      parts.push(`${address.first_name || ""} ${address.last_name || ""}`.trim())
    }

    // Add company if available
    if (address.company) {
      parts.push(address.company)
    }

    // Add address lines
    if (address.address_1) parts.push(address.address_1)
    if (address.address_2) parts.push(address.address_2)

    // Add city, province, postal code
    const locationParts = [
      address.city,
      address.province,
      address.postal_code,
    ].filter(Boolean)

    if (locationParts.length > 0) {
      parts.push(locationParts.join(", "))
    }

    // Add country code
    if (address.country_code) {
      parts.push(address.country_code.toUpperCase())
    }

    // Add phone if present
    if (address.phone) {
      parts.push(`📞 ${address.phone}`)
    }

    return parts.length > 0 ? parts.join(", ") : "N/A"
  }

  const formatCustomer = (order: any) => {
    const name =
      order.customer?.first_name || order.customer?.last_name
        ? `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`.trim()
        : null
    const email = order.email || order.customer?.email
    return name || email || "N/A"
  }


  if (isLoading) {
    return (
      <Container>
        <Heading level="h1">Orders with Address</Heading>
        <div className="mt-4">Loading...</div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Heading level="h1">Orders with Address</Heading>
        <div className="mt-4 text-red-600">
          Error loading orders: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </Container>
    )
  }

  const orders = data?.orders || []
  const count = data?.count || 0
  const totalPages = Math.ceil(count / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Orders with Address</Heading>
        <Text size="small" className="text-gray-500">
          Total: {count}
        </Text>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Order #</Table.HeaderCell>
              <Table.HeaderCell>Customer</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Customer Address</Table.HeaderCell>
              <Table.HeaderCell>Total</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {orders.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6} className="text-center py-8">
                  <Text size="small" className="text-gray-500">
                    No orders found
                  </Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              orders.map((order: any) => {
                const address = order.shipping_address || order.billing_address
                
                // Get total from summary - amounts are already in whole units (e.g., 1630 BDT)
                // Use current_order_total (what customer owes) or accounting_total (order total)
                let total = 0
                if (order.summary?.current_order_total !== undefined) {
                  total = order.summary.current_order_total
                } else if (order.summary?.accounting_total !== undefined) {
                  total = order.summary.accounting_total
                } else if (order.total !== undefined && order.total !== null) {
                  total = order.total
                }
                
                const currency = order.currency_code || "BDT"
                
                return (
                  <Table.Row 
                    key={order.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <Table.Cell>
                      <Text size="small" weight="plus" className="text-blue-600 hover:underline">
                        #{order.display_id || order.id.slice(0, 8)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">{formatCustomer(order)}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">{order.email || order.customer?.email || "N/A"}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text
                        size="small"
                        className={`capitalize ${
                          order.status === "completed"
                            ? "text-green-600"
                            : order.status === "canceled"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {order.status}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small" className="max-w-xs truncate">
                        {formatAddress(address)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small" weight="plus">
                        {total > 0 ? (
                          // Amounts are already in whole units (e.g., 1630 = 1630 BDT)
                          // Format with proper currency symbol
                          new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: currency,
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(total)
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString("en-US", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "N/A"}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                )
              })
            )}
          </Table.Body>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Text size="small" className="text-gray-500">
            Page {currentPage} of {totalPages}
          </Text>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= count}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Orders with Address",
  link: {
    label: "Orders (Address)",
    icon: "ShoppingBag",
  },
})

export default OrdersWithAddressPage

