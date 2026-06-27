import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { retrieveLoyaltyDetails } from "@lib/data/loyalty"
import { listOrders } from "@lib/data/orders"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Coin from "@modules/common/icons/coin"

export const metadata: Metadata = {
    title: "Zahan Coins",
    description: "Manage your Zahan Coins and check history.",
}

export default async function LoyaltyPage() {
    const customer = await retrieveCustomer()
    if (!customer) {
        notFound()
    }

    const { account, history } = await retrieveLoyaltyDetails()
    const pointsBalance = account?.points || 0

    // Fetch customer's orders to map order database IDs to user-friendly order numbers (display_id)
    const orders = await listOrders(100).catch(() => [])
    const orderMap: Record<string, number> = {}
    if (orders && Array.isArray(orders)) {
        orders.forEach(o => {
            orderMap[o.id] = o.display_id
        })
    }

    // Formatter to clean description strings of database UUIDs and replace with display_id
    const formatDescription = (desc: string | null, orderId: string | null) => {
        if (!desc) return ""
        if (orderId && orderMap[orderId]) {
            return desc.replace(orderId, `${orderMap[orderId]}`)
        }
        return desc
    }

    return (
        <div className="w-full" data-testid="loyalty-page-wrapper">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-y-4">
                <h1 className="text-2xl font-semibold text-gray-900">Zahan Coins</h1>
                <p className="text-base text-gray-500">
                    Earn coins on every purchase and redeem them for exclusive discounts at checkout.
                </p>
            </div>

            {/* Premium Black Theme Card */}
            <div className="relative overflow-hidden rounded-2xl bg-neutral-950 p-8 text-white shadow-md border border-neutral-900 mb-10">
                {/* Background decorative glow (subtle white/gray) */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/[0.03] blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-neutral-900/30 blur-3xl" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10 relative">
                    <div className="flex flex-col gap-y-1">
                        <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Your Reward Balance</span>
                        <div className="flex items-center gap-x-3 mt-1.5">
                            <Coin size={40} />
                            <span className="text-5xl font-bold tracking-tight text-white">{pointsBalance}</span>
                            <span className="text-lg font-semibold text-neutral-400 self-end mb-1">Coins</span>
                        </div>
                    </div>

                    <div className="bg-white/[0.04] backdrop-blur-md rounded-xl p-4 border border-white/10 max-w-sm">
                        <h3 className="font-semibold text-white text-sm flex items-center gap-x-2">
                            <Coin size={16} /> How It Works
                        </h3>
                        <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                            Every time you place an order, you earn coins based on the order subtotal. You can redeem these coins at checkout for a direct cash discount on your order.
                        </p>
                    </div>
                </div>
            </div>

            {/* History logs */}
            <div className="w-full flex flex-col gap-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Points History</h2>

                {history.length === 0 ? (
                    <div className="text-center py-16 border rounded-2xl border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center">
                        <Coin size={40} className="mb-3 opacity-60" />
                        <p className="text-gray-500 font-medium mb-1">No point transactions yet</p>
                        <p className="text-gray-400 text-xs">Points earned from your future orders will show up here.</p>
                    </div>
                ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold">Description</th>
                                    <th className="p-4 font-semibold">Transaction Type</th>
                                    <th className="p-4 font-semibold text-right">Coins</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {history.map((log) => {
                                    const isPositive = log.points > 0
                                    const formattedPoints = isPositive ? `+${log.points}` : log.points

                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50/30">
                                            <td className="p-4 text-gray-500">
                                                {new Date(log.created_at).toLocaleDateString(undefined, {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </td>
                                            <td className="p-4 text-gray-950 font-medium">
                                                {formatDescription(log.description, log.order_id)}
                                                {log.order_id && (
                                                    <span className="block text-xs mt-1">
                                                        <LocalizedClientLink 
                                                            href={`/account/orders/details/${log.order_id}`}
                                                            className="text-gray-500 hover:text-gray-900 underline"
                                                        >
                                                            View Order #{orderMap[log.order_id] || "Details"}
                                                        </LocalizedClientLink>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {log.type === "earn" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                                                        Earned
                                                    </span>
                                                )}
                                                {log.type === "redeem" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200/50">
                                                        Redeemed
                                                    </span>
                                                )}
                                                {log.type === "refund" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100/50">
                                                        Refund
                                                    </span>
                                                )}
                                                {log.type === "admin_adjustment" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100/50">
                                                        Adjustment
                                                    </span>
                                                )}
                                            </td>
                                            <td className={`p-4 text-right font-bold ${isPositive ? "text-emerald-600" : "text-gray-900"}`}>
                                                {formattedPoints}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
