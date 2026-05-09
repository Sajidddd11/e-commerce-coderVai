import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Table, Select, Input, Button } from "@medusajs/ui"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import codImage from "../../assets/cod.png"
import sslImage from "../../assets/ssl.png"
import invoiceLogo from "../../../../public/Zahan Fashion simplified.svg"

const OrdersWithAddressPage = () => {
  const navigate = useNavigate()
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Filter states
  const [searchInput, setSearchInput] = useState('') // User input
  const [search, setSearch] = useState('') // Debounced value for API
  const [dateRange, setDateRange] = useState('all')
  const [paymentMethod, setPaymentMethod] = useState('all')
  const [orderStatus, setOrderStatus] = useState('all')
  const [paymentStatus, setPaymentStatus] = useState('all')

  // Column visibility state
  const STORAGE_KEY = 'orders_visible_columns'

  const columnDefinitions = [
    { key: 'orderNumber', label: 'Order #' },
    { key: 'name', label: 'Name' },
    { key: 'mobile', label: 'Mobile Number' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
    { key: 'payment', label: 'Payment' },
    { key: 'address', label: 'Address' },
    { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'total', label: 'Total' },
    { key: 'date', label: 'Date' },
    { key: 'printStatus', label: 'Print Status' },
    { key: 'print', label: 'Print' },
  ]

  // Initialize visible columns from localStorage or default to all visible
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    }
    // Default: all columns visible
    return columnDefinitions.reduce((acc, col) => {
      acc[col.key] = true
      return acc
    }, {} as Record<string, boolean>)
  })

  // Save visible columns to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns))
    }
  }, [visibleColumns])

  // Toggle column visibility
  const toggleColumn = (columnKey: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  // Show all columns
  const showAllColumns = () => {
    const allVisible = columnDefinitions.reduce((acc, col) => {
      acc[col.key] = true
      return acc
    }, {} as Record<string, boolean>)
    setVisibleColumns(allVisible)
  }

  // Hide all columns
  const hideAllColumns = () => {
    const allHidden = columnDefinitions.reduce((acc, col) => {
      acc[col.key] = false
      return acc
    }, {} as Record<string, boolean>)
    setVisibleColumns(allHidden)
  }

  // Column visibility dropdown state
  const [showColumnSelector, setShowColumnSelector] = useState(false)

  // Close column selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showColumnSelector && !target.closest('.column-selector-container')) {
        setShowColumnSelector(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showColumnSelector])

  // Sync top scrollbar width with table width
  useEffect(() => {
    const syncScrollbarWidth = () => {
      const table = document.querySelector('.table-scroll-bottom table') as HTMLElement
      const topScrollContent = document.querySelector('.top-scroll-content') as HTMLElement
      if (table && topScrollContent) {
        topScrollContent.style.width = `${table.scrollWidth}px`
      }
    }

    // Sync on mount and when data changes
    syncScrollbarWidth()

    // Re-sync when window resizes
    window.addEventListener('resize', syncScrollbarWidth)
    return () => window.removeEventListener('resize', syncScrollbarWidth)
  }, [data, visibleColumns])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setOffset(0) // Reset to first page when search changes
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timer)
  }, [searchInput])

  // Fetch ALL orders once from backend (no filters in API call)
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // First, check total count to decide strategy
        const countResponse = await fetch(
          `/admin/orders-with-address?limit=1&offset=0`,
          { credentials: "include" }
        )
        const countData = await countResponse.json()
        const totalOrders = countData.count || 0

        // Strategy: Client-side for <500 orders, Server-side for >=500
        const useClientSideFiltering = totalOrders < 500

        if (useClientSideFiltering) {
          // Fetch all orders for client-side filtering
          const response = await fetch(
            `/admin/orders-with-address?limit=${totalOrders}&offset=0`,
            { credentials: "include" }
          )
          if (!response.ok) throw new Error("Failed to fetch orders")
          const result = await response.json()
          setData({ ...result, useClientFiltering: true })
        } else {
          // For large datasets, we'll fetch with filters on server
          setData({ orders: [], count: totalOrders, useClientFiltering: false })
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // Fetch with server-side filtering when dataset is large
  useEffect(() => {
    if (!data || data.useClientFiltering) return // Skip if using client-side filtering

    const fetchFilteredOrders = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          limit: String(limit),
          offset: String(offset),
        })

        if (search) params.append('q', search) // Use 'q' for general search on server
        if (dateRange !== 'all') params.append('date_range', dateRange)
        if (paymentMethod !== 'all') params.append('payment_provider', paymentMethod) // Use payment_provider for server
        if (orderStatus !== 'all') params.append('status', orderStatus)
        if (paymentStatus !== 'all') params.append('payment_status', paymentStatus)

        const response = await fetch(
          `/admin/orders-with-address?${params.toString()}`,
          { credentials: "include" }
        )
        if (!response.ok) throw new Error("Failed to fetch orders")
        const result = await response.json()
        setData({ ...result, useClientFiltering: false })
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setIsLoading(false)
      }
    }
    fetchFilteredOrders()
  }, [search, dateRange, paymentMethod, orderStatus, paymentStatus, offset, limit, data?.useClientFiltering])


  // CLIENT-SIDE vs SERVER-SIDE filtering strategy
  const useClientFiltering = data?.useClientFiltering || false
  let orders: any[]
  let count: number

  if (useClientFiltering) {
    // CLIENT-SIDE filtering for small datasets (<500 orders)
    const allOrders = data?.orders || []

    const filteredOrders = allOrders.filter((order: any) => {
      const address = order.shipping_address || order.billing_address

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const displayId = String(order.display_id || '').toLowerCase()
        const email = String(order.email || '').toLowerCase()
        const phone = String(address?.phone || '').toLowerCase()
        const name = `${address?.first_name || ''} ${address?.last_name || ''}`.toLowerCase()

        const matchesSearch = displayId.includes(searchLower) ||
          email.includes(searchLower) ||
          phone.includes(searchLower) ||
          name.includes(searchLower)

        if (!matchesSearch) return false
      }

      // Date range filter
      if (dateRange !== 'all') {
        const orderDate = new Date(order.created_at)
        const now = new Date()

        if (dateRange === 'today') {
          const today = new Date(now.setHours(0, 0, 0, 0))
          if (orderDate < today) return false
        } else if (dateRange === 'week') {
          const weekAgo = new Date(now.setDate(now.getDate() - 7))
          if (orderDate < weekAgo) return false
        } else if (dateRange === 'month') {
          const monthAgo = new Date(now.setDate(now.getDate() - 30))
          if (orderDate < monthAgo) return false
        }
      }

      // Order status filter
      if (orderStatus !== 'all') {
        const customStatus = order.metadata?.custom_status || order.status
        if (customStatus !== orderStatus) return false
      }

      // Payment method filter
      if (paymentMethod !== 'all') {
        if (order.payment_provider !== paymentMethod) return false
      }

      // Payment status filter
      if (paymentStatus !== 'all') {
        if (order.payment_status !== paymentStatus) return false
      }

      return true
    })

    // Apply pagination
    count = filteredOrders.length
    const startIndex = offset
    const endIndex = startIndex + limit
    orders = filteredOrders.slice(startIndex, endIndex)
  } else {
    // SERVER-SIDE filtering for large datasets (>=500 orders)
    orders = data?.orders || []
    count = data?.count || 0
  }

  const formatName = (address: any) => {
    if (!address) return "N/A"

    const name = `${address.first_name || ""} ${address.last_name || ""}`.trim()
    return name || "N/A"
  }

  const formatPhone = (address: any) => {
    if (!address) return "N/A"
    return address.phone || "N/A"
  }

  const formatAddress = (address: any) => {
    if (!address) return "N/A"

    // Only include address parts, NOT name or phone
    const parts: string[] = []

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

    return parts.length > 0 ? parts.join(", ") : "N/A"
  }

  const formatPaymentMethod = (order: any) => {
    if (!order.payment_provider) return "N/A"

    const providerId = order.payment_provider.toLowerCase()

    // Extract the actual provider name from the ID
    // Provider IDs are like "pp_sslcommerz_01..." or "pp_manual_01..."
    if (providerId.includes("sslcommerz")) {
      return "SSLCommerz"
    } else if (providerId.includes("manual")) {
      return "Manual/COD"
    } else if (providerId.includes("cod") || providerId.includes("system")) {
      return "COD"
    } else {
      // Try to extract a readable name from the provider ID
      const match = providerId.match(/pp_(\w+)_/)
      if (match && match[1]) {
        // Capitalize first letter
        return match[1].charAt(0).toUpperCase() + match[1].slice(1)
      }
      return "Other"
    }
  }

  // Status options for dropdown
  const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', color: 'text-gray-600 bg-gray-100' },
    { value: 'processing', label: 'Processing', color: 'text-yellow-700 bg-yellow-100' },
    { value: 'shipped', label: 'Shipped', color: 'text-blue-600 bg-blue-100' },
    { value: 'delivered', label: 'Delivered', color: 'text-green-600 bg-green-100' },
    { value: 'canceled', label: 'Cancelled', color: 'text-red-600 bg-red-100' },
    { value: 'refunded', label: 'Refunded', color: 'text-amber-700 bg-amber-100' },
  ]

  // Get current status (priority: custom_status > official status)
  const getCurrentStatus = (order: any) => {
    return order.metadata?.custom_status || order.status
  }

  // Get status color classes
  const getStatusColor = (status: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status)
    return option?.color || 'text-gray-600 bg-gray-100'
  }

  // Helper function to get payment status square color
  const getPaymentStatusSquareColor = (status: string) => {
    const colors: Record<string, string> = {
      authorized: 'bg-orange-500',
      captured: 'bg-green-500',
      completed: 'bg-green-500',  // Medusa returns 'completed' for captured payments
      canceled: 'bg-red-500',
      awaiting: 'bg-gray-400',
      not_paid: 'bg-gray-400',
      pending: 'bg-blue-500',
    }
    return colors[status] || 'bg-gray-400'
  }

  // Helper function to format payment status label
  const formatPaymentStatus = (status: string | null) => {
    if (!status) return 'N/A'
    // Map 'completed' to 'Captured' to match Medusa's prebuilt pages
    if (status === 'completed') return 'Captured'
    // Capitalize first letter of each word and replace underscores with spaces
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  // Handle status change
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId)

    try {
      // Optimistic update - update local state immediately
      const updatedOrders = data.orders.map((o: any) => {
        if (o.id === orderId) {
          return {
            ...o,
            metadata: {
              ...o.metadata,
              custom_status: newStatus
            }
          }
        }
        return o
      })

      setData({ ...data, orders: updatedOrders })

      // Then update on backend
      await fetch(`/admin/orders/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          metadata: {
            custom_status: newStatus,
          },
        }),
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Failed to update order status")
      // Revert on error - refresh from server
      const response = await fetch(
        `/admin/orders-with-address?limit=${limit}&offset=${offset}`,
        { credentials: 'include' }
      )
      const freshData = await response.json()
      setData(freshData)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // Handle print order - triggers print dialog directly without opening new window
  const handlePrint = async (order: any, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click navigation

    // Debug: Log full order data
    console.log("=== FULL ORDER DATA FOR PRINTING ===")
    console.log("Complete order object:", JSON.stringify(order, null, 2))
    console.log("Payment provider:", order.payment_provider)
    console.log("Email:", order.email)
    console.log("Customer email:", order.customer?.email)
    console.log("Shipping address:", order.shipping_address)
    console.log("Billing address:", order.billing_address)
    console.log("Summary:", order.summary)
    console.log("Items:", order.items)
    console.log("=====================================")

    try {
      // Fetch order items (not included in orders-with-address endpoint)
      const itemsResponse = await fetch(`/admin/orders/${order.id}`, {
        credentials: "include",
      })
      const itemsData = await itemsResponse.json()

      // Merge items into order object
      const fullOrder = {
        ...order,
        items: itemsData.order?.items || []
      }

      const address = fullOrder.shipping_address || fullOrder.billing_address

      const formatCurrency = (amount: number, currency?: string) => {
        const currencyCode = currency || fullOrder.currency_code || "BDT"
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currencyCode,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount)
      }

      // Format payment method from provider ID
      const getPaymentMethod = () => {
        if (!fullOrder.payment_provider) return "N/A"

        const providerId = fullOrder.payment_provider.toLowerCase()

        if (providerId.includes("sslcommerz")) {
          return "SSLCommerz"
        } else if (providerId.includes("manual")) {
          return "Manual/COD"
        } else if (providerId.includes("cod") || providerId.includes("system")) {
          return "COD"
        } else {
          const match = providerId.match(/pp_(\w+)_/)
          if (match && match[1]) {
            return match[1].charAt(0).toUpperCase() + match[1].slice(1)
          }
          return "Other"
        }
      }

      // Generate print HTML
      const printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Order #${fullOrder.display_id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 900px;
              margin: 0 auto;
            }
            .invoice-header {
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .invoice-header-left {
              flex: 1;
            }
            .invoice-header-left .info-row {
              justify-content: flex-start;
            }
            .invoice-header-right {
              flex-shrink: 0;
              margin-left: 20px;
            }
            .invoice-header-right svg {
              width: 120px;
              height: auto;
            }
            .invoice-title {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-top: 20px;
              margin-bottom: 10px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .info-label {
              font-weight: bold;
              width: 150px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .items-table th,
            .items-table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            .items-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .total-section {
              margin-top: 30px;
              border-top: 2px solid #333;
              padding-top: 20px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 16px;
            }
            .grand-total {
              font-size: 20px;
              font-weight: bold;
              margin-top: 10px;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div class="invoice-header-left">
              <div class="invoice-title">ORDER INVOICE</div>
              <div class="info-row">
                <span class="info-label">Order Number:</span>
                <span>#${fullOrder.display_id}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Order Date:</span>
                <span>${new Date(fullOrder.created_at).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span style="text-transform: capitalize">${fullOrder.metadata?.custom_status || fullOrder.status}</span>
              </div>
            </div>
            <div class="invoice-header-right">
              <img src="${invoiceLogo}" alt="Zahan Fashion Logo" style="width: 120px; height: auto;" />
            </div>
          </div>

          <div class="section-title">Customer Information</div>
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span>${address?.first_name || ""} ${address?.last_name || ""}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span>${fullOrder.email || "N/A"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone:</span>
            <span>${address?.phone || "N/A"}</span>
          </div>

          <div class="section-title">Shipping Address</div>
          <div style="margin-left: 20px;">
            ${address?.first_name || ""} ${address?.last_name || ""}<br/>
            ${address?.address_1 || ""}<br/>
            ${address?.address_2 ? address.address_2 + "<br/>" : ""}
            ${address?.city || ""}, ${address?.province || ""} ${address?.postal_code || ""}<br/>
            ${address?.country_code?.toUpperCase() || ""}
          </div>

          <div class="section-title">Order Items</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Variant</th>
                <th style="text-align: center">Quantity</th>
                <th style="text-align: right">Unit Price</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${fullOrder.items?.map((item: any) => `
                <tr>
                  <td>${item.title}</td>
                  <td>${item.variant?.title || "N/A"}</td>
                  <td style="text-align: center">${item.quantity}</td>
                  <td style="text-align: right">${formatCurrency(item.unit_price || 0)}</td>
                  <td style="text-align: right">${formatCurrency((item.unit_price || 0) * item.quantity)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row grand-total">
              <span>TOTAL:</span>
              <span>${formatCurrency(fullOrder.summary?.current_order_total || fullOrder.summary?.accounting_total || 0)}</span>
            </div>
          </div>

          <div class="section-title">Payment Information</div>
          <div class="info-row">
            <span class="info-label">Payment Status:</span>
            <span style="text-transform: capitalize">${fullOrder.payment_status === "completed" ? "Captured" : fullOrder.payment_status}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span>${getPaymentMethod()}</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
              // Close window after print dialog is closed
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
        </html>
      `

      // Create hidden iframe
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      document.body.appendChild(iframe)

      // Write content and trigger print
      const iframeDoc = iframe.contentWindow?.document
      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write(printHTML)
        iframeDoc.close()
      }

      // Clean up iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 1000)

      // Mark order as printed
      try {
        // Optimistic update - update local state immediately
        const updatedOrders = data.orders.map((o: any) => {
          if (o.id === order.id) {
            return {
              ...o,
              metadata: {
                ...o.metadata,
                printed_at: new Date().toISOString()
              }
            }
          }
          return o
        })

        setData({ ...data, orders: updatedOrders })

        // Then update on backend
        await fetch(`/admin/orders/${order.id}/mark-printed`, {
          method: 'POST',
          credentials: 'include',
        })
      } catch (error) {
        console.error("Error marking order as printed:", error)
        // Don't show error to user - printing was successful
      }


    } catch (error) {
      console.error("Error printing order:", error)
      alert("Failed to print order")
    }
  }

  // Handle manual print status toggle
  const handleTogglePrintStatus = async (order: any, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click navigation

    try {
      // Optimistic update - update local state immediately
      const updatedOrders = data.orders.map((o: any) => {
        if (o.id === order.id) {
          return {
            ...o,
            metadata: {
              ...o.metadata,
              printed_at: o.metadata?.printed_at ? null : new Date().toISOString()
            }
          }
        }
        return o
      })

      setData({ ...data, orders: updatedOrders })

      // Then update on backend
      if (order.metadata?.printed_at) {
        // Unmark as printed - clear the metadata
        await fetch(`/admin/orders/${order.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            metadata: {
              ...order.metadata,
              printed_at: null
            }
          })
        })
      } else {
        // Mark as printed
        await fetch(`/admin/orders/${order.id}/mark-printed`, {
          method: 'POST',
          credentials: 'include',
        })
      }
    } catch (error) {
      console.error("Error toggling print status:", error)
      alert("Failed to update print status")
      // Revert on error - refresh from server
      const response = await fetch(
        `/admin/orders-with-address?limit=${limit}&offset=${offset}`,
        { credentials: 'include' }
      )
      const freshData = await response.json()
      setData(freshData)
    }
  }

  if (error) {
    return (
      <Container>
        <Heading level="h1">Orders Manager</Heading>
        <div className="mt-4 text-red-600">
          Error loading orders: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </Container>
    )
  }

  const totalPages = Math.ceil(count / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Orders Manager</Heading>
        <div className="flex items-center gap-4">
          <Text size="small" className="text-gray-500">
            Total: {count}
          </Text>
          {/* Column Visibility Selector */}
          <div className="relative column-selector-container">
            <Button
              size="small"
              variant="secondary"
              onClick={() => setShowColumnSelector(!showColumnSelector)}
            >
              Columns
            </Button>
            {showColumnSelector && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-200">
                  <Text size="small" weight="plus" className="mb-2">Show/Hide Columns</Text>
                  <div className="flex gap-2">
                    <button
                      onClick={showAllColumns}
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Show All
                    </button>
                    <button
                      onClick={hideAllColumns}
                      className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Hide All
                    </button>
                  </div>
                </div>
                <div className="p-2 max-h-96 overflow-y-auto">
                  {columnDefinitions.map(column => (
                    <label
                      key={column.key}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[column.key] || false}
                        onChange={() => toggleColumn(column.key)}
                        className="rounded border-gray-300"
                      />
                      <Text size="small">{column.label}</Text>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="xl:col-span-2">
            <Input
              size="small"
              placeholder="Search order #, email, phone, name..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
              }}
            />
          </div>

          {/* Date Range */}
          <div>
            <Select size="small" value={dateRange} onValueChange={(val) => {
              setDateRange(val)
              setOffset(0)
            }}>
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Date Range" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All Time</Select.Item>
                <Select.Item value="today">Today</Select.Item>
                <Select.Item value="week">This Week</Select.Item>
                <Select.Item value="month">This Month</Select.Item>
              </Select.Content>
            </Select>
          </div>

          {/* Payment Method */}
          <div>
            <Select size="small" value={paymentMethod} onValueChange={(val) => {
              setPaymentMethod(val)
              setOffset(0)
            }}>
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Payment Method" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All Methods</Select.Item>
                <Select.Item value="pp_sslcommerz_default">SSLCommerz</Select.Item>
                <Select.Item value="pp_system_default">COD</Select.Item>
              </Select.Content>
            </Select>
          </div>

          {/* Order Status */}
          <div>
            <Select size="small" value={orderStatus} onValueChange={(val) => {
              setOrderStatus(val)
              setOffset(0)
            }}>
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Order Status" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All Statuses</Select.Item>
                <Select.Item value="pending">Pending</Select.Item>
                <Select.Item value="processing">Processing</Select.Item>
                <Select.Item value="shipped">Shipped</Select.Item>
                <Select.Item value="delivered">Delivered</Select.Item>
                <Select.Item value="canceled">Cancelled</Select.Item>
                <Select.Item value="refunded">Refunded</Select.Item>
              </Select.Content>
            </Select>
          </div>

          {/* Payment Status */}
          <div>
            <Select size="small" value={paymentStatus} onValueChange={(val) => {
              setPaymentStatus(val)
              setOffset(0)
            }}>
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Payment Status" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All Payment</Select.Item>
                <Select.Item value="authorized">Authorized</Select.Item>
                <Select.Item value="completed">Captured</Select.Item>
                <Select.Item value="canceled">Cancelled</Select.Item>
              </Select.Content>
            </Select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchInput || dateRange !== 'all' || paymentMethod !== 'all' || orderStatus !== 'all' || paymentStatus !== 'all') && (
          <div className="mt-4">
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                setSearchInput('')
                setSearch('')
                setDateRange('all')
                setPaymentMethod('all')
                setOrderStatus('all')
                setPaymentStatus('all')
                setOffset(0)
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Top Scrollbar */}
      <div
        className="overflow-x-auto w-full mb-2"
        style={{ maxWidth: '100%' }}
        onScroll={(e) => {
          const target = e.target as HTMLDivElement
          const bottom = document.querySelector('.table-scroll-bottom') as HTMLDivElement
          if (bottom && bottom.scrollLeft !== target.scrollLeft) {
            bottom.scrollLeft = target.scrollLeft
          }
        }}
      >
        <div className="h-1" style={{ width: 'fit-content', minWidth: '100%' }}>
          <div className="top-scroll-content" style={{ width: '2000px', height: '1px' }}></div>
        </div>
      </div>

      {/* Table with Bottom Scrollbar */}
      <div
        className="overflow-x-auto w-full table-scroll-bottom"
        style={{ maxWidth: '100%' }}
        onScroll={(e) => {
          const target = e.target as HTMLDivElement
          const top = document.querySelector('.overflow-x-auto') as HTMLDivElement
          if (top && top.scrollLeft !== target.scrollLeft) {
            top.scrollLeft = target.scrollLeft
          }
        }}
      >
        <Table>
          <Table.Header>
            <Table.Row>
              {visibleColumns.orderNumber && <Table.HeaderCell>Order #</Table.HeaderCell>}
              {visibleColumns.name && <Table.HeaderCell>Name</Table.HeaderCell>}
              {visibleColumns.mobile && <Table.HeaderCell>Mobile Number</Table.HeaderCell>}
              {visibleColumns.email && <Table.HeaderCell>Email</Table.HeaderCell>}
              {visibleColumns.status && <Table.HeaderCell>Status</Table.HeaderCell>}
              {visibleColumns.payment && <Table.HeaderCell>Payment</Table.HeaderCell>}
              {visibleColumns.address && <Table.HeaderCell>Address</Table.HeaderCell>}
              {visibleColumns.paymentMethod && <Table.HeaderCell>Payment Method</Table.HeaderCell>}
              {visibleColumns.total && <Table.HeaderCell>Total</Table.HeaderCell>}
              {visibleColumns.date && <Table.HeaderCell>Date</Table.HeaderCell>}
              {visibleColumns.printStatus && <Table.HeaderCell>Print Status</Table.HeaderCell>}
              {visibleColumns.print && <Table.HeaderCell>Print</Table.HeaderCell>}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              <Table.Row>
                <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="text-center py-8">
                  <Text size="small" className="text-gray-500">
                    Loading...
                  </Text>
                </td>
              </Table.Row>
            ) : orders.length === 0 ? (
              <Table.Row>
                <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="text-center py-8">
                  <Text size="small" className="text-gray-500">
                    No orders found
                  </Text>
                </td>
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
                    {visibleColumns.orderNumber && (
                      <Table.Cell>
                        <Text size="small" weight="plus" className="text-blue-600 hover:underline">
                          #{order.display_id || order.id.slice(0, 8)}
                        </Text>
                      </Table.Cell>
                    )}
                    {visibleColumns.name && (
                      <Table.Cell>
                        <Text size="small">{formatName(address)}</Text>
                      </Table.Cell>
                    )}
                    {visibleColumns.mobile && (
                      <Table.Cell>
                        <Text size="small">{formatPhone(address)}</Text>
                      </Table.Cell>
                    )}
                    {visibleColumns.email && (
                      <Table.Cell>
                        <Text size="small">{order.email || order.customer?.email || "N/A"}</Text>
                      </Table.Cell>
                    )}
                    {visibleColumns.status && (
                      <Table.Cell onClick={(e) => e.stopPropagation()}>
                        <Select
                          size="small"
                          value={getCurrentStatus(order)}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                          disabled={updatingOrderId === order.id}
                        >
                          <Select.Trigger className={`capitalize px-2 py-1 rounded ${getStatusColor(getCurrentStatus(order))}`}>
                            {getCurrentStatus(order)}
                          </Select.Trigger>
                          <Select.Content>
                            {STATUS_OPTIONS.map(opt => (
                              <Select.Item key={opt.value} value={opt.value}>
                                {opt.label}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                      </Table.Cell>
                    )}
                    {visibleColumns.payment && (
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-sm ${getPaymentStatusSquareColor(order.payment_status || '')}`}></div>
                          <Text size="small">{formatPaymentStatus(order.payment_status)}</Text>
                        </div>
                      </Table.Cell>
                    )}
                    {visibleColumns.address && (
                      <Table.Cell>
                        <Text size="small" className="whitespace-normal">
                          {formatAddress(address)}
                        </Text>
                      </Table.Cell>
                    )}
                    {visibleColumns.paymentMethod && (
                      <Table.Cell>
                        {(() => {
                          const providerId = order.payment_provider?.toLowerCase() || ''

                          if (providerId.includes("sslcommerz")) {
                            return <img src={sslImage} alt="SSLCommerz" style={{ height: '30px', width: '80px', objectFit: 'contain' }} />
                          } else if (providerId.includes("manual") || providerId.includes("cod") || providerId.includes("system")) {
                            return <img src={codImage} alt="COD" style={{ height: '30px', width: 'auto' }} />
                          } else {
                            return <Text size="small">{formatPaymentMethod(order)}</Text>
                          }
                        })()}
                      </Table.Cell>
                    )}
                    {visibleColumns.total && (
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
                    )}
                    {visibleColumns.date && (
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
                    )}
                    {visibleColumns.printStatus && (
                      <Table.Cell
                        onClick={(e) => handleTogglePrintStatus(order, e)}
                        className="cursor-pointer hover:bg-gray-50"
                        title="Click to toggle print status"
                      >
                        {order.metadata?.printed_at ? (
                          <div className="flex items-center gap-1">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                              ✓
                            </span>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">
                                {new Date(order.metadata.printed_at).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {new Date(order.metadata.printed_at).toLocaleString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 hover:text-gray-600">Click to mark</span>
                        )}
                      </Table.Cell>
                    )}
                    {visibleColumns.print && (
                      <Table.Cell onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={(e) => handlePrint(order, e)}
                        >
                          Print
                        </Button>
                      </Table.Cell>
                    )}
                  </Table.Row>
                )
              })
            )}
          </Table.Body>
        </Table>
      </div>

      {/* Pagination - Always reserve space to prevent layout shift */}
      <div className="flex items-center justify-between mt-4 min-h-[40px]">
        {totalPages > 1 ? (
          <>
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
          </>
        ) : (
          <div className="w-full"></div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Orders Manager",
})

export default OrdersWithAddressPage

