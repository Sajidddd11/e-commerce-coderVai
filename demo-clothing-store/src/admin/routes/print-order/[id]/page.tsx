import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

const PrintOrderPage = () => {
    const { id } = useParams()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`/admin/orders/${id}`, {
                    credentials: "include",
                })
                const data = await response.json()
                setOrder(data.order)
                setLoading(false)

                // Trigger print dialog after order is loaded
                setTimeout(() => {
                    window.print()
                }, 500)
            } catch (error) {
                console.error("Error fetching order:", error)
                setLoading(false)
            }
        }

        if (id) {
            fetchOrder()
        }
    }, [id])

    if (loading) {
        return (
            <div className="p-8 text-center">
                <p>Loading order details...</p>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="p-8 text-center">
                <p>Order not found</p>
            </div>
        )
    }

    const address = order.shipping_address || order.billing_address
    const formatCurrency = (amount: number, currency?: string) => {
        // Default to BDT if no currency is provided
        const currencyCode = currency || order.currency_code || "BDT"
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)
    }

    return (
        <div className="print-container p-8 max-w-4xl mx-auto bg-white">
            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
        
        .print-container {
          font-family: Arial, sans-serif;
        }
        
        .invoice-header {
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 30px;
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
      `}</style>

            {/* Header */}
            <div className="invoice-header">
                <div className="invoice-title">ORDER INVOICE</div>
                <div className="info-row">
                    <span className="info-label">Order Number:</span>
                    <span>#{order.display_id}</span>
                </div>
                <div className="info-row">
                    <span className="info-label">Order Date:</span>
                    <span>
                        {new Date(order.created_at).toLocaleString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
                <div className="info-row">
                    <span className="info-label">Status:</span>
                    <span style={{ textTransform: "capitalize" }}>
                        {order.metadata?.custom_status || order.status}
                    </span>
                </div>
            </div>

            {/* Customer Information */}
            <div className="section-title">Customer Information</div>
            <div className="info-row">
                <span className="info-label">Name:</span>
                <span>
                    {address?.first_name} {address?.last_name}
                </span>
            </div>
            <div className="info-row">
                <span className="info-label">Email:</span>
                <span>{order.email || "N/A"}</span>
            </div>
            <div className="info-row">
                <span className="info-label">Phone:</span>
                <span>{address?.phone || "N/A"}</span>
            </div>

            {/* Shipping Address */}
            <div className="section-title">Shipping Address</div>
            <div style={{ marginLeft: "20px" }}>
                {address?.first_name} {address?.last_name}
                <br />
                {address?.company && (
                    <>
                        <strong>[{address.company}]</strong>
                        <br />
                    </>
                )}
                {address?.address_1}
                <br />
                {address?.address_2 && (
                    <>
                        {address.address_2}
                        <br />
                    </>
                )}
                {address?.city}, {address?.province} {address?.postal_code}
                <br />
                {address?.country_code?.toUpperCase()}
            </div>

            {/* Delivery Instructions */}
            {order.metadata?.delivery_instructions && (
                <>
                    <div className="section-title">Delivery Instructions</div>
                    <div style={{ marginLeft: "20px", fontStyle: "italic" }}>
                        {order.metadata.delivery_instructions}
                    </div>
                </>
            )}

            {/* Order Items */}
            <div className="section-title">Order Items</div>
            <table className="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Variant</th>
                        <th style={{ textAlign: "center" }}>Quantity</th>
                        <th style={{ textAlign: "right" }}>Unit Price</th>
                        <th style={{ textAlign: "right" }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items?.map((item: any) => (
                        <tr key={item.id}>
                            <td>{item.title}</td>
                            <td>{item.variant?.title || "N/A"}</td>
                            <td style={{ textAlign: "center" }}>{item.quantity}</td>
                            <td style={{ textAlign: "right" }}>
                                {formatCurrency(item.unit_price || 0, order.currency_code)}
                            </td>
                            <td style={{ textAlign: "right" }}>
                                {formatCurrency(
                                    (item.unit_price || 0) * item.quantity,
                                    order.currency_code
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Order Summary */}
            <div className="total-section">
                <div className="total-row">
                    <span>Subtotal:</span>
                    <span>
                        {formatCurrency(
                            order.summary?.subtotal || 0,
                            order.currency_code
                        )}
                    </span>
                </div>
                {order.summary?.shipping_total > 0 && (
                    <div className="total-row">
                        <span>Shipping:</span>
                        <span>
                            {formatCurrency(
                                order.summary.shipping_total,
                                order.currency_code
                            )}
                        </span>
                    </div>
                )}
                {order.summary?.tax_total > 0 && (
                    <div className="total-row">
                        <span>Tax:</span>
                        <span>
                            {formatCurrency(order.summary.tax_total, order.currency_code)}
                        </span>
                    </div>
                )}
                {order.summary?.discount_total > 0 && (
                    <div className="total-row">
                        <span>Discount:</span>
                        <span>
                            -{formatCurrency(order.summary.discount_total, order.currency_code)}
                        </span>
                    </div>
                )}
                <div className="total-row grand-total">
                    <span>GRAND TOTAL:</span>
                    <span>
                        {formatCurrency(
                            order.summary?.current_order_total || order.summary?.accounting_total || 0,
                            order.currency_code
                        )}
                    </span>
                </div>
            </div>

            {/* Payment Information */}
            <div className="section-title">Payment Information</div>
            <div className="info-row">
                <span className="info-label">Payment Status:</span>
                <span style={{ textTransform: "capitalize" }}>
                    {order.payment_status === "completed" ? "Captured" : order.payment_status}
                </span>
            </div>
            <div className="info-row">
                <span className="info-label">Payment Method:</span>
                <span>
                    {order.payment_collection?.payment_providers?.[0]?.id || "N/A"}
                </span>
            </div>

            {/* Close button for screen (hidden in print) */}
            <div className="no-print" style={{ marginTop: "30px", textAlign: "center" }}>
                <button
                    onClick={() => window.close()}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#333",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    Close Window
                </button>
            </div>
        </div>
    )
}

export default PrintOrderPage
