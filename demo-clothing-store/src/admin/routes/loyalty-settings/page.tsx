import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Label, Text, Table, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { Spinner, CheckCircle } from "@medusajs/icons"

const LoyaltySettingsPage = () => {
    // Settings state
    const [settings, setSettings] = useState({
        points_per_bdt_earned: 1,
        points_per_bdt_discount: 100,
    })
    const [loadingSettings, setLoadingSettings] = useState(true)
    const [savingSettings, setSavingSettings] = useState(false)

    // Customers state
    const [customers, setCustomers] = useState<any[]>([])
    const [loadingCustomers, setLoadingCustomers] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [customersPage, setCustomersPage] = useState(1)

    // History state
    const [history, setHistory] = useState<any[]>([])
    const [loadingHistory, setLoadingHistory] = useState(true)
    const [historyPage, setHistoryPage] = useState(1)

    // Adjustment modal state
    const [activeCustomer, setActiveCustomer] = useState<any | null>(null)
    const [adjustPoints, setAdjustPoints] = useState<number>(0)
    const [adjustReason, setAdjustReason] = useState("")
    const [adjusting, setAdjusting] = useState(false)

    // Tab state
    const [activeTab, setActiveTab] = useState("customers")

    const CUSTOMERS_LIMIT = 10
    const HISTORY_LIMIT = 10

    useEffect(() => {
        fetchSettings()
        fetchCustomers()
        fetchHistory()
    }, [])

    const apiFetch = (url: string, init?: RequestInit) =>
        fetch(url, { credentials: "include", ...init })

    const fetchSettings = async () => {
        try {
            setLoadingSettings(true)
            const res = await apiFetch("/admin/loyalty/settings")
            const data = await res.json()
            if (data.settings) {
                setSettings({
                    points_per_bdt_earned: Number(data.settings.points_per_bdt_earned) ?? 1,
                    points_per_bdt_discount: Number(data.settings.points_per_bdt_discount) ?? 100,
                })
            }
        } catch (error) {
            console.error("Failed to load loyalty settings", error)
        } finally {
            setLoadingSettings(false)
        }
    }

    const fetchCustomers = async () => {
        try {
            setLoadingCustomers(true)
            const res = await apiFetch("/admin/loyalty/customers")
            const data = await res.json()
            setCustomers(data.customers || [])
        } catch (error) {
            console.error("Failed to load customers list", error)
        } finally {
            setLoadingCustomers(false)
        }
    }

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true)
            const res = await apiFetch("/admin/loyalty/history")
            const data = await res.json()
            setHistory(data.history || [])
        } catch (error) {
            console.error("Failed to load loyalty history", error)
        } finally {
            setLoadingHistory(false)
        }
    }

    const handleSaveSettings = async () => {
        try {
            setSavingSettings(true)
            const res = await apiFetch("/admin/loyalty/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            })
            const data = await res.json()
            if (res.ok) {
                alert("Loyalty settings updated successfully!")
            } else {
                alert("Error updating settings: " + data.message)
            }
        } catch (error: any) {
            alert("Error: " + error.message)
        } finally {
            setSavingSettings(false)
        }
    }

    const handleAdjustPoints = async () => {
        if (!activeCustomer || adjustPoints === 0) return
        try {
            setAdjusting(true)
            const res = await apiFetch("/admin/loyalty/adjust", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_id: activeCustomer.customer_id,
                    points: adjustPoints,
                    description: adjustReason,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                // Update local state points balance
                setCustomers(prev =>
                    prev.map(c =>
                        c.customer_id === activeCustomer.customer_id
                            ? { ...c, points: c.points + adjustPoints }
                            : c
                    )
                )
                fetchHistory()
                setActiveCustomer(null)
                setAdjustPoints(0)
                setAdjustReason("")
                alert("Points adjusted successfully!")
            } else {
                alert("Failed to adjust points: " + data.message)
            }
        } catch (error: any) {
            alert("Error adjusting points: " + error.message)
        } finally {
            setAdjusting(false)
        }
    }

    const filteredCustomers = customers.filter(
        c =>
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Calculate Stats
    const totalPoints = customers.reduce((sum, c) => sum + (c.points || 0), 0)
    const discountRate = settings.points_per_bdt_discount || 100
    const eqDiscount = Math.floor(totalPoints / discountRate)

    const totalRedeemed = history
        .filter(h => h.type === "redeem")
        .reduce((sum, h) => sum + Math.abs(h.points), 0)
    const totalRedeemedValue = Math.floor(totalRedeemed / discountRate)

    // Slicing data for pagination
    const totalCustomersPages = Math.ceil(filteredCustomers.length / CUSTOMERS_LIMIT)
    const displayedCustomers = filteredCustomers.slice(
        (customersPage - 1) * CUSTOMERS_LIMIT,
        customersPage * CUSTOMERS_LIMIT
    )

    const totalHistoryPages = Math.ceil(history.length / HISTORY_LIMIT)
    const displayedHistory = history.slice(
        (historyPage - 1) * HISTORY_LIMIT,
        historyPage * HISTORY_LIMIT
    )

    return (
        <div className="flex flex-col gap-y-6">
            {/* Page Header */}
            <div>
                <Heading level="h1" className="text-2xl font-bold text-ui-fg-base">
                    Zahan Coins
                </Heading>
                <Text className="text-ui-fg-subtle mt-1 text-sm">
                    Configure rules, check history, and manage customer Zahan Coins balances.
                </Text>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-ui-border-base flex gap-x-6">
                <button
                    onClick={() => setActiveTab("customers")}
                    className={`pb-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
                        activeTab === "customers"
                            ? "border-ui-border-interactive text-ui-fg-base"
                            : "border-transparent text-ui-fg-subtle hover:text-ui-fg-base"
                    }`}
                >
                    Customers
                </button>
                <button
                    onClick={() => setActiveTab("settings")}
                    className={`pb-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
                        activeTab === "settings"
                            ? "border-ui-border-interactive text-ui-fg-base"
                            : "border-transparent text-ui-fg-subtle hover:text-ui-fg-base"
                    }`}
                >
                    Settings
                </button>
            </div>

            {activeTab === "customers" && (
                <div className="flex flex-col gap-y-6">
                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl shadow-sm flex items-center gap-x-4">
                            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                            <div>
                                <Text className="text-ui-fg-subtle text-xs font-medium uppercase tracking-wider">Total Active Coins</Text>
                                <div className="flex items-baseline gap-x-1.5 mt-1">
                                    <Heading level="h2" className="text-2xl font-bold text-ui-fg-base">
                                        🪙 {loadingCustomers ? "..." : totalPoints.toLocaleString()}
                                    </Heading>
                                </div>
                            </div>
                        </Container>

                        <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl shadow-sm flex items-center gap-x-4">
                            <div className="bg-blue-50 text-blue-600 p-3 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 0 0 3.182 0l5.178-5.178a2.25 2.25 0 0 0 0-3.182L12.019 3.659A2.25 2.25 0 0 0 10.428 3ZM6.75 8.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                </svg>
                            </div>
                            <div>
                                <Text className="text-ui-fg-subtle text-xs font-medium uppercase tracking-wider">Equivalent Discount</Text>
                                <div className="flex items-baseline gap-x-1.5 mt-1">
                                    <Heading level="h2" className="text-2xl font-bold text-ui-fg-base">
                                        ৳ {loadingCustomers || loadingSettings ? "..." : eqDiscount.toLocaleString()} BDT
                                    </Heading>
                                </div>
                            </div>
                        </Container>

                        <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl shadow-sm flex items-center gap-x-4">
                            <div className="bg-amber-50 text-amber-600 p-3 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            </div>
                            <div>
                                <Text className="text-ui-fg-subtle text-xs font-medium uppercase tracking-wider">Total Redeemed (Withdraws)</Text>
                                <div className="flex items-baseline gap-x-1.5 mt-1">
                                    <Heading level="h2" className="text-2xl font-bold text-ui-fg-base">
                                        🪙 {loadingHistory ? "..." : totalRedeemed.toLocaleString()}
                                    </Heading>
                                    {!loadingHistory && !loadingSettings && (
                                        <Text className="text-xs text-ui-fg-subtle ms-1 inline-block">
                                            (≈ ৳ {totalRedeemedValue.toLocaleString()} BDT)
                                        </Text>
                                    )}
                                </div>
                            </div>
                        </Container>
                    </div>

                    {/* Customers Table Container */}
                    <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <Heading level="h2" className="text-lg font-semibold text-ui-fg-base">
                                    Customer Point Balances
                                </Heading>
                                <Text className="text-ui-fg-muted text-xs mt-0.5">
                                    Search for customer accounts and perform manual adjustments.
                                </Text>
                            </div>

                            <Input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={e => {
                                    setSearchTerm(e.target.value)
                                    setCustomersPage(1)
                                }}
                                className="max-w-xs w-full"
                            />
                        </div>

                        {loadingCustomers ? (
                            <div className="flex justify-center py-12">
                                <Spinner className="animate-spin text-ui-fg-muted" />
                            </div>
                        ) : filteredCustomers.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-ui-border-base rounded-lg bg-ui-bg-subtle/50">
                                <Text className="text-ui-fg-muted">No customer loyalty accounts found matching search.</Text>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell>Customer Name</Table.HeaderCell>
                                                <Table.HeaderCell>Email Address</Table.HeaderCell>
                                                <Table.HeaderCell>Current Coin Balance</Table.HeaderCell>
                                                <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {displayedCustomers.map(customer => (
                                                <Table.Row key={customer.id} className="hover:bg-ui-bg-subtle/50">
                                                    <Table.Cell className="font-medium text-ui-fg-base">
                                                        {customer.name}
                                                    </Table.Cell>
                                                    <Table.Cell className="text-ui-fg-subtle">
                                                        {customer.email}
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <Badge color="green" className="font-semibold px-2 py-0.5">
                                                            🪙 {customer.points} Coins
                                                        </Badge>
                                                    </Table.Cell>
                                                    <Table.Cell className="text-right">
                                                        <Button
                                                            size="small"
                                                            variant="secondary"
                                                            onClick={() => setActiveCustomer(customer)}
                                                        >
                                                            Adjust Points
                                                        </Button>
                                                    </Table.Cell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table>
                                </div>

                                {totalCustomersPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-ui-border-base">
                                        <Button
                                            variant="secondary"
                                            size="small"
                                            onClick={() => setCustomersPage(prev => Math.max(1, prev - 1))}
                                            disabled={customersPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <span className="text-sm text-ui-fg-subtle">
                                            Page {customersPage} of {totalCustomersPages} ({filteredCustomers.length} total)
                                        </span>
                                        <Button
                                            variant="secondary"
                                            size="small"
                                            onClick={() => setCustomersPage(prev => Math.min(totalCustomersPages, prev + 1))}
                                            disabled={customersPage === totalCustomersPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </Container>

                    {/* Loyalty Transaction History Card */}
                    <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <Heading level="h2" className="text-lg font-semibold text-ui-fg-base">
                                    Loyalty History & Withdrawals
                                </Heading>
                                <Text className="text-ui-fg-muted text-xs mt-0.5">
                                    Audit trail of all points earned, redeemed, refunded, or adjusted.
                                </Text>
                            </div>
                        </div>

                        {loadingHistory ? (
                            <div className="flex justify-center py-12">
                                <Spinner className="animate-spin text-ui-fg-muted" />
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-ui-border-base rounded-lg bg-ui-bg-subtle/50">
                                <Text className="text-ui-fg-muted">No point transaction history found.</Text>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell>Date</Table.HeaderCell>
                                                <Table.HeaderCell>Customer Name</Table.HeaderCell>
                                                <Table.HeaderCell>Email Address</Table.HeaderCell>
                                                <Table.HeaderCell>Type</Table.HeaderCell>
                                                <Table.HeaderCell>Coins</Table.HeaderCell>
                                                <Table.HeaderCell>Description</Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {displayedHistory.map(item => {
                                                const isPositive = item.points > 0
                                                return (
                                                    <Table.Row key={item.id} className="hover:bg-ui-bg-subtle/50">
                                                        <Table.Cell className="text-ui-fg-subtle text-xs">
                                                            {new Date(item.created_at).toLocaleString()}
                                                        </Table.Cell>
                                                        <Table.Cell className="font-medium text-ui-fg-base">
                                                            {item.name}
                                                        </Table.Cell>
                                                        <Table.Cell className="text-ui-fg-subtle text-xs">
                                                            {item.email}
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            {item.type === "earn" && (
                                                                <Badge color="green" className="font-semibold px-2 py-0.5">
                                                                    Earned
                                                                </Badge>
                                                            )}
                                                            {item.type === "redeem" && (
                                                                <Badge color="grey" className="font-semibold px-2 py-0.5">
                                                                    Redeemed
                                                                </Badge>
                                                            )}
                                                            {item.type === "refund" && (
                                                                <Badge color="orange" className="font-semibold px-2 py-0.5">
                                                                    Refund
                                                                </Badge>
                                                            )}
                                                            {item.type === "admin_adjustment" && (
                                                                <Badge color="blue" className="font-semibold px-2 py-0.5">
                                                                    Adjustment
                                                                </Badge>
                                                            )}
                                                        </Table.Cell>
                                                        <Table.Cell className={`font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                                                            {isPositive ? `+${item.points}` : item.points}
                                                        </Table.Cell>
                                                        <Table.Cell className="text-ui-fg-subtle max-w-xs truncate text-xs" title={item.description}>
                                                            {item.description}
                                                        </Table.Cell>
                                                    </Table.Row>
                                                )
                                            })}
                                        </Table.Body>
                                    </Table>
                                </div>

                                {totalHistoryPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-ui-border-base">
                                        <Button
                                            variant="secondary"
                                            size="small"
                                            onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                                            disabled={historyPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <span className="text-sm text-ui-fg-subtle">
                                            Page {historyPage} of {totalHistoryPages} ({history.length} total)
                                        </span>
                                        <Button
                                            variant="secondary"
                                            size="small"
                                            onClick={() => setHistoryPage(prev => Math.min(totalHistoryPages, prev + 1))}
                                            disabled={historyPage === totalHistoryPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </Container>
                </div>
            )}

            {activeTab === "settings" && (
                <div>
                    {/* Settings Form Container */}
                    <Container className="p-6 bg-ui-bg-base border border-ui-border-base rounded-xl shadow-sm max-w-[720px]">
                        <Heading level="h2" className="text-lg font-semibold text-ui-fg-base mb-6">
                            Reward Rates & Rules
                        </Heading>
                        
                        {loadingSettings ? (
                            <div className="flex justify-center py-6">
                                <Spinner className="animate-spin text-ui-fg-muted" />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-y-6">
                                <div className="flex flex-col gap-y-2">
                                    <Label htmlFor="earn-rate" className="font-medium text-ui-fg-base">
                                        Earning Rate (Coins per 1 BDT spent)
                                    </Label>
                                    <Input
                                        id="earn-rate"
                                        type="number"
                                        min={0}
                                        value={settings.points_per_bdt_earned}
                                        onChange={e =>
                                            setSettings({ ...settings, points_per_bdt_earned: Number(e.target.value) })
                                        }
                                        placeholder="e.g. 1"
                                        className="w-full max-w-sm"
                                    />
                                    <Text className="text-xs text-ui-fg-muted mt-1">
                                        Points earned for each BDT spent. 1 point/BDT is 1% value if 100 points = 1 BDT.
                                    </Text>
                                </div>

                                <div className="flex flex-col gap-y-2">
                                    <Label htmlFor="redeem-rate" className="font-medium text-ui-fg-base">
                                        Redemption Rate (Coins needed for 1 BDT discount)
                                    </Label>
                                    <Input
                                        id="redeem-rate"
                                        type="number"
                                        min={1}
                                        value={settings.points_per_bdt_discount}
                                        onChange={e =>
                                            setSettings({ ...settings, points_per_bdt_discount: Number(e.target.value) })
                                        }
                                        placeholder="e.g. 100"
                                        className="w-full max-w-sm"
                                    />
                                    <Text className="text-xs text-ui-fg-muted mt-1">
                                        Number of points required to get a 1 BDT discount. Points will never be fractional.
                                    </Text>
                                </div>

                                <div className="pt-4 border-t border-ui-border-base flex justify-end">
                                    <Button onClick={handleSaveSettings} isLoading={savingSettings} variant="primary">
                                        Save Configuration
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Container>
                </div>
            )}

            {/* Adjust Points Modal (Overlay) */}
            {activeCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all">
                    <div className="bg-ui-bg-base p-6 rounded-xl border border-ui-border-base shadow-xl max-w-md w-full mx-4 flex flex-col gap-y-4">
                        <div>
                            <Heading level="h3" className="text-lg font-bold text-ui-fg-base">
                                Adjust Points Balance
                            </Heading>
                            <Text className="text-ui-fg-subtle text-xs mt-1">
                                Manually add or deduct points for <span className="font-semibold text-ui-fg-base">{activeCustomer.name}</span>.
                            </Text>
                        </div>

                        <div className="flex flex-col gap-y-1.5 mt-2">
                            <Label htmlFor="adjust-amount" className="font-medium text-ui-fg-base text-sm">
                                Adjustment Amount (Integer)
                            </Label>
                            <Input
                                id="adjust-amount"
                                type="number"
                                value={adjustPoints}
                                onChange={e => setAdjustPoints(Number(e.target.value))}
                                placeholder="Use positive for credit, negative for debit"
                                className="w-full"
                            />
                            <Text className="text-[10px] text-ui-fg-muted mt-0.5">
                                Enter positive value to add coins (e.g. 500) or negative value to subtract (e.g. -200).
                            </Text>
                        </div>

                        <div className="flex flex-col gap-y-1.5">
                            <Label htmlFor="adjust-reason" className="font-medium text-ui-fg-base text-sm">
                                Reason / Description
                            </Label>
                            <Input
                                id="adjust-reason"
                                type="text"
                                value={adjustReason}
                                onChange={e => setAdjustReason(e.target.value)}
                                placeholder="e.g. Goodwill credit, refund override"
                                className="w-full"
                            />
                        </div>

                        <div className="flex gap-x-3 justify-end mt-4 pt-4 border-t border-ui-border-base">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setActiveCustomer(null)
                                    setAdjustPoints(0)
                                    setAdjustReason("")
                                }}
                                disabled={adjusting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAdjustPoints}
                                isLoading={adjusting}
                                disabled={adjustPoints === 0 || !adjustReason}
                                variant="primary"
                            >
                                Apply Adjustment
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export const config = defineRouteConfig({
    label: "Zahan Coins",
    icon: CheckCircle, // Re-using standard icon
})

export default LoyaltySettingsPage
