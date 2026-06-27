import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Table, Badge, Input, Label, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { Spinner, Users } from "@medusajs/icons"

const LoyaltyCustomersPage = () => {
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
        fetchCustomers()
    }, [])

    const apiFetch = (url: string, init?: RequestInit) =>
        fetch(url, { credentials: "include", ...init })

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
        <div className="flex flex-col gap-y-6">
            {/* Page Header */}
            <div>
                <Heading level="h1" className="text-2xl font-bold text-ui-fg-base">
                    Zahan Coins Customers
                </Heading>
                <Text className="text-ui-fg-subtle mt-1 text-sm">
                    Manage customer Zahan Coins accounts and perform manual coin adjustments.
                </Text>
            </div>

            {/* Customers Card */}
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
                        onChange={e => setSearchTerm(e.target.value)}
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
                )}
            </Container>

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
    label: "Zahan Coins Customers",
    icon: Users,
})

export default LoyaltyCustomersPage
