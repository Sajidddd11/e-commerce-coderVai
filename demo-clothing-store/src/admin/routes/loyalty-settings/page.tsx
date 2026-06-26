import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Table, Badge, Input, Label, Text } from "@medusajs/ui"
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

    // Adjustment modal state
    const [activeCustomer, setActiveCustomer] = useState<any | null>(null)
    const [adjustPoints, setAdjustPoints] = useState<number>(0)
    const [adjustReason, setAdjustReason] = useState("")
    const [adjusting, setAdjusting] = useState(false)

    useEffect(() => {
        fetchSettings()
        fetchCustomers()
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

    return (
        <div className="flex flex-col gap-y-8 p-6 max-w-6xl mx-auto">
            {/* Page Header */}
            <div>
                <Heading level="h1" className="text-3xl font-bold text-slate-900">
                    Loyalty Reward Coins
                </Heading>
                <Text className="text-slate-500 mt-1 text-sm">
                    Configure your storefront's coin rules and manage customer points balances.
                </Text>
            </div>

            {/* Config Card */}
            <Container className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                <Heading level="h2" className="text-lg font-semibold text-slate-800 mb-6">
                    Reward Rates & Rules
                </Heading>
                
                {loadingSettings ? (
                    <div className="flex justify-center py-6">
                        <Spinner className="animate-spin text-slate-400" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-y-2">
                            <Label htmlFor="earn-rate" className="font-medium text-slate-700">
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
                            <Text className="text-xs text-slate-400 mt-1">
                                Points earned for each BDT spent. 1 point/BDT is 1% value if 100 points = 1 BDT.
                            </Text>
                        </div>

                        <div className="flex flex-col gap-y-2">
                            <Label htmlFor="redeem-rate" className="font-medium text-slate-700">
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
                            <Text className="text-xs text-slate-400 mt-1">
                                Number of points required to get a 1 BDT discount. Point points will never be fractional.
                            </Text>
                        </div>

                        <div className="col-span-1 md:col-span-2 pt-2 border-t border-slate-100 flex justify-end">
                            <Button onClick={handleSaveSettings} isLoading={savingSettings} className="bg-slate-900 text-white hover:bg-slate-800">
                                Save Configuration
                            </Button>
                        </div>
                    </div>
                )}
            </Container>

            {/* Customers Card */}
            <Container className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <Heading level="h2" className="text-lg font-semibold text-slate-800">
                            Customer Point Balances
                        </Heading>
                        <Text className="text-slate-400 text-xs mt-0.5">
                            Search for customer accounts and perform manual adjustments.
                        </Text>
                    </div>

                    <Input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="max-w-xs w-full"
                    />
                </div>

                {loadingCustomers ? (
                    <div className="flex justify-center py-12">
                        <Spinner className="animate-spin text-slate-400" />
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                        <Text className="text-slate-400">No customer loyalty accounts found matching search.</Text>
                    </div>
                ) : (
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
                                {filteredCustomers.map(customer => (
                                    <Table.Row key={customer.id} className="hover:bg-slate-50/50">
                                        <Table.Cell className="font-medium text-slate-800">
                                            {customer.name}
                                        </Table.Cell>
                                        <Table.Cell className="text-slate-600">
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
                                                className="border border-slate-200 hover:bg-slate-100"
                                            >
                                                Adjust Points
                                            </Button>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </div>
                )}
            </Container>

            {/* Adjust Points Modal (Overlay) */}
            {activeCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xl max-w-md w-full mx-4 flex flex-col gap-y-4">
                        <div>
                            <Heading level="h3" className="text-lg font-bold text-slate-900">
                                Adjust Points Balance
                            </Heading>
                            <Text className="text-slate-500 text-xs mt-1">
                                Manually add or deduct points for <span className="font-semibold text-slate-700">{activeCustomer.name}</span>.
                            </Text>
                        </div>

                        <div className="flex flex-col gap-y-1.5 mt-2">
                            <Label htmlFor="adjust-amount" className="font-medium text-slate-700 text-sm">
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
                            <Text className="text-[10px] text-slate-400 mt-0.5">
                                Enter positive value to add coins (e.g. 500) or negative value to subtract (e.g. -200).
                            </Text>
                        </div>

                        <div className="flex flex-col gap-y-1.5">
                            <Label htmlFor="adjust-reason" className="font-medium text-slate-700 text-sm">
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

                        <div className="flex gap-x-3 justify-end mt-4 pt-4 border-t border-slate-100">
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
                                className="bg-slate-900 text-white hover:bg-slate-800"
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
    label: "Loyalty Coins",
    icon: CheckCircle, // Re-using standard icon
})

export default LoyaltySettingsPage
