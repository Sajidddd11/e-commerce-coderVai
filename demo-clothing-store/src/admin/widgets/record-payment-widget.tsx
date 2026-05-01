import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Input } from "@medusajs/ui"
import { useState, useEffect, useCallback } from "react"
import { CurrencyDollar, Plus, Check, ExclamationCircle } from "@medusajs/icons"

type ManualPayment = {
  amount: number
  note: string
  recorded_at: string
  recorded_by: string
  captured: boolean
}

type PaymentSummary = {
  order_id: string
  currency_code: string
  order_total: number
  captured_amount: number
  outstanding_amount: number
  payment_status: string
  payment_collection_id: string | null
  manual_payments: ManualPayment[]
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  completed:            { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  label: "Fully Paid" },
  partially_captured:   { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   label: "Partially Paid" },
  authorized:           { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400", label: "Authorized" },
  partially_authorized: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400", label: "Partially Authorized" },
  awaiting:             { bg: "bg-gray-50",   text: "text-gray-700",   dot: "bg-gray-400",   label: "Awaiting" },
  not_paid:             { bg: "bg-gray-50",   text: "text-gray-600",   dot: "bg-gray-400",   label: "Not Paid" },
  canceled:             { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500",    label: "Canceled" },
  failed:               { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500",    label: "Failed" },
}

const RecordPaymentWidget = ({ data }: { data: any }) => {
  const orderId = data?.id
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const res = await fetch(`/admin/orders/${orderId}/record-payment`, {
        credentials: "include",
      })
      if (res.ok) {
        const json = await res.json()
        setSummary(json)
      }
    } catch (err) {
      console.error("Failed to fetch payment summary:", err)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)

    const parsedAmount = parseFloat(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than 0")
      return
    }

    if (summary && parsedAmount > summary.outstanding_amount + 0.01) {
      const confirmed = window.confirm(
        `You are recording ${formatCurrency(parsedAmount)} but the outstanding amount is only ${formatCurrency(summary.outstanding_amount)}. Continue anyway?`
      )
      if (!confirmed) return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/admin/orders/${orderId}/record-payment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount, note: note.trim() }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.message || "Failed to record payment")
        if (json.hint) setError(`${json.message}\n${json.hint}`)
        return
      }

      setSuccess(`Successfully recorded ${formatCurrency(parsedAmount)} payment`)
      setAmount("")
      setNote("")
      setShowForm(false)
      await fetchSummary()
      // Reload the full page so Medusa's native Summary panel
      // (Paid Total / Outstanding amount / Activity) also picks up the change.
      // Small delay so the user briefly sees the success state.
      setTimeout(() => {
        window.location.reload()
      }, 600)
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (val: number) => {
    const currency = summary?.currency_code?.toUpperCase() || data?.currency_code?.toUpperCase() || "BDT"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(val)
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return iso
    }
  }

  const statusMeta = STATUS_COLORS[summary?.payment_status || "not_paid"] || STATUS_COLORS.not_paid
  const isFullyPaid = summary?.payment_status === "completed"

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <CurrencyDollar className="text-ui-fg-muted" />
          <Heading level="h2">Manual Payment</Heading>
        </div>
        {!isFullyPaid && (
          <Button
            size="small"
            variant={showForm ? "secondary" : "primary"}
            onClick={() => {
              setShowForm((s) => !s)
              setError(null)
              setSuccess(null)
            }}
          >
            {showForm ? "Cancel" : "Record Payment"}
          </Button>
        )}
      </div>

      {/* Payment summary */}
      <div className="px-6 py-4">
        {loading ? (
          <Text size="small" className="text-ui-fg-muted">Loading payment info…</Text>
        ) : summary ? (
          <div className="space-y-3">
            {/* Status badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusMeta.bg}`}>
              <span className={`w-2 h-2 rounded-full ${statusMeta.dot}`} />
              <Text size="small" className={`font-medium ${statusMeta.text}`}>
                {statusMeta.label}
              </Text>
            </div>

            {/* Amount breakdown */}
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div className="bg-ui-bg-subtle rounded-lg p-3 text-center">
                <Text size="xsmall" className="text-ui-fg-muted mb-1">Order Total</Text>
                <Text size="small" className="font-semibold text-ui-fg-base">
                  {formatCurrency(summary.order_total)}
                </Text>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <Text size="xsmall" className="text-green-600 mb-1">Captured</Text>
                <Text size="small" className="font-semibold text-green-700">
                  {formatCurrency(summary.captured_amount)}
                </Text>
              </div>
              <div className={`rounded-lg p-3 text-center ${summary.outstanding_amount > 0 ? "bg-red-50" : "bg-green-50"}`}>
                <Text size="xsmall" className={summary.outstanding_amount > 0 ? "text-red-500 mb-1" : "text-green-600 mb-1"}>
                  Outstanding
                </Text>
                <Text size="small" className={`font-semibold ${summary.outstanding_amount > 0 ? "text-red-700" : "text-green-700"}`}>
                  {formatCurrency(summary.outstanding_amount)}
                </Text>
              </div>
            </div>
          </div>
        ) : (
          <Text size="small" className="text-ui-fg-muted">No payment data available</Text>
        )}
      </div>

      {/* Record payment form */}
      {showForm && (
        <div className="px-6 py-4 bg-ui-bg-subtle">
          <Text size="small" weight="plus" className="mb-3">Record Offline / Cash Payment</Text>

          {/* Amount */}
          <div className="mb-3">
            <label className="block text-xs text-ui-fg-muted mb-1">
              Amount ({summary?.currency_code?.toUpperCase() || "BDT"}) *
            </label>
            <Input
              size="small"
              type="number"
              min="0.01"
              step="0.01"
              placeholder={`e.g. ${summary ? Math.min(100, summary.outstanding_amount) : 100}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {/* Note */}
          <div className="mb-4">
            <label className="block text-xs text-ui-fg-muted mb-1">
              Note (optional — e.g. "Cash in hand", "Bank transfer ref: 123")
            </label>
            <Input
              size="small"
              type="text"
              placeholder="Add a reference or note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {/* Errors / Success */}
          {error && (
            <div className="mb-3 flex items-start gap-2 p-3 bg-red-50 rounded-lg">
              <ExclamationCircle className="text-red-500 mt-0.5 shrink-0" />
              <Text size="small" className="text-red-700 whitespace-pre-line">{error}</Text>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                setShowForm(false)
                setError(null)
                setAmount("")
                setNote("")
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="primary"
              onClick={handleSubmit}
              isLoading={submitting}
            >
              Confirm Payment
            </Button>
          </div>
        </div>
      )}

      {/* Success toast */}
      {success && !showForm && (
        <div className="mx-6 my-2 flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <Check className="text-green-600 shrink-0" />
          <Text size="small" className="text-green-700">{success}</Text>
        </div>
      )}

      {/* Payment history */}
      {summary && summary.manual_payments.length > 0 && (
        <div className="px-6 py-4">
          <Text size="small" weight="plus" className="mb-3 text-ui-fg-subtle">
            Payment History ({summary.manual_payments.length})
          </Text>
          <div className="space-y-2">
            {[...summary.manual_payments].reverse().map((mp, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 p-3 bg-ui-bg-subtle rounded-lg border border-ui-border-base"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${mp.captured ? "bg-green-500" : "bg-orange-400"}`} />
                  <div className="min-w-0">
                    <Text size="small" className="font-semibold text-ui-fg-base">
                      {formatCurrency(mp.amount)}
                    </Text>
                    {mp.note && (
                      <Text size="xsmall" className="text-ui-fg-muted truncate max-w-[220px]">
                        {mp.note}
                      </Text>
                    )}
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {formatDate(mp.recorded_at)}
                    </Text>
                  </div>
                </div>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                    mp.captured
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {mp.captured ? "Captured" : "Logged"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty history state */}
      {summary && summary.manual_payments.length === 0 && !loading && (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle italic">
            No manual payments recorded yet.
          </Text>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default RecordPaymentWidget
