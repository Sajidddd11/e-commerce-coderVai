import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { retrieveLoyaltyDetails } from "@lib/data/loyalty"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
    title: "Loyalty Rewards",
    description: "Manage your loyalty reward points and check history.",
}

export default async function LoyaltyPage() {
    const customer = await retrieveCustomer()
    if (!customer) {
        notFound()
    }

    const { account, history } = await retrieveLoyaltyDetails()
    const pointsBalance = account?.points || 0

    return (
        <div className="w-full" data-testid="loyalty-page-wrapper">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-y-4">
                <h1 className="text-2xl font-semibold text-slate-900">Loyalty Rewards</h1>
                <p className="text-base text-slate-500">
                    Earn coins on every purchase and redeem them for exclusive discounts at checkout.
                </p>
            </div>

            {/* Premium Glassmorphic Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-8 text-white shadow-xl border border-indigo-900/30 mb-10">
                {/* Background decorative glow */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-yellow-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10 relative">
                    <div className="flex flex-col gap-y-1">
                        <span className="text-indigo-200 text-sm font-medium tracking-wide uppercase">Your Reward Balance</span>
                        <div className="flex items-baseline gap-x-2 mt-1">
                            <span className="text-5xl font-extrabold tracking-tight text-yellow-400">🪙 {pointsBalance}</span>
                            <span className="text-xl font-semibold text-slate-300">Coins</span>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 max-w-sm">
                        <h3 className="font-semibold text-yellow-300 text-sm flex items-center gap-x-1.5">
                            ✨ How It Works
                        </h3>
                        <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                            Every time you place an order, you earn coins based on the order subtotal. You can redeem these coins at checkout for a direct cash discount on your order.
                        </p>
                    </div>
                </div>
            </div>

            {/* History logs */}
            <div className="w-full flex flex-col gap-y-4">
                <h2 className="text-xl font-semibold text-slate-900">Points History</h2>

                {history.length === 0 ? (
                    <div className="text-center py-16 border rounded-2xl border-dashed border-slate-200 bg-slate-50/50">
                        <span className="text-3xl block mb-3">🪙</span>
                        <p className="text-slate-500 font-medium mb-1">No point transactions yet</p>
                        <p className="text-slate-400 text-xs">Points earned from your future orders will show up here.</p>
                    </div>
                ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold">Description</th>
                                    <th className="p-4 font-semibold">Transaction Type</th>
                                    <th className="p-4 font-semibold text-right">Coins</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {history.map((log) => {
                                    const isPositive = log.points > 0
                                    const formattedPoints = isPositive ? `+${log.points}` : log.points

                                    return (
                                        <tr key={log.id} className="hover:bg-slate-50/50">
                                            <td className="p-4 text-slate-500">
                                                {new Date(log.created_at).toLocaleDateString(undefined, {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </td>
                                            <td className="p-4 text-slate-700">
                                                {log.description}
                                                {log.order_id && (
                                                    <span className="block text-xs mt-0.5 text-indigo-600 hover:underline">
                                                        <LocalizedClientLink href={`/account/orders/details/${log.order_id}`}>
                                                            View Order Details
                                                        </LocalizedClientLink>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {log.type === "earn" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                        Earned
                                                    </span>
                                                )}
                                                {log.type === "redeem" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                        Redeemed
                                                    </span>
                                                )}
                                                {log.type === "refund" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                        Refund
                                                    </span>
                                                )}
                                                {log.type === "admin_adjustment" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Adjustment
                                                    </span>
                                                )}
                                            </td>
                                            <td className={`p-4 text-right font-semibold ${isPositive ? "text-emerald-600" : "text-slate-800"}`}>
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
