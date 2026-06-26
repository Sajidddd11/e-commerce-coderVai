"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heading, Text, Switch } from "@medusajs/ui"
import { retrieveLoyaltyDetails, applyLoyaltyPoints, removeLoyaltyPoints } from "@lib/data/loyalty"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import ErrorMessage from "../error-message"
import Coin from "@modules/common/icons/coin"

type LoyaltyRedeemProps = {
    cart: HttpTypes.StoreCart
    customer: HttpTypes.StoreCustomer | null
}

const LoyaltyRedeem: React.FC<LoyaltyRedeemProps> = ({ cart, customer }) => {
    const router = useRouter()
    const [pointsBalance, setPointsBalance] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        if (customer) {
            retrieveLoyaltyDetails().then(({ account }) => {
                if (account) {
                    setPointsBalance(account.points)
                }
            })
        }
    }, [customer, cart])

    if (!customer) {
        return (
            <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col gap-y-1">
                <Text className="txt-medium font-semibold text-slate-800 flex items-center gap-x-1.5">
                    <Coin size={16} /> Loyalty Reward Coins
                </Text>
                <Text className="text-xs text-slate-500">
                    Log in to your account during checkout to earn coins on this purchase and redeem points for a discount!
                </Text>
            </div>
        )
    }

    const metadata = (cart.metadata || {}) as Record<string, any>
    const appliedPoints = Number(metadata.loyalty_points_to_redeem) || 0
    const appliedDiscount = Number(metadata.loyalty_discount_amount) || 0

    const handleToggleChange = async (checked: boolean) => {
        setErrorMessage("")
        if (checked) {
            if (pointsBalance === null || pointsBalance <= 0) return
            try {
                setLoading(true)
                const res = await applyLoyaltyPoints(cart.id, pointsBalance)
                if (res && (res as any).error) {
                    setErrorMessage((res as any).error)
                } else {
                    // Reload balance
                    const { account } = await retrieveLoyaltyDetails()
                    if (account) setPointsBalance(account.points)
                    router.refresh()
                }
            } catch (err: any) {
                setErrorMessage(err.message || "Failed to apply coins")
            } finally {
                setLoading(false)
            }
        } else {
            try {
                setLoading(true)
                const res = await removeLoyaltyPoints(cart.id)
                if (res && (res as any).error) {
                    setErrorMessage((res as any).error)
                } else {
                    // Reload balance
                    const { account } = await retrieveLoyaltyDetails()
                    if (account) setPointsBalance(account.points)
                    router.refresh()
                }
            } catch (err: any) {
                setErrorMessage(err.message || "Failed to remove coins")
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <div className="w-full bg-white flex flex-col border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <Heading level="h3" className="txt-medium text-lg flex items-center gap-x-1.5 text-slate-800">
                    <Coin size={18} /> Loyalty Reward Coins
                </Heading>
                {pointsBalance !== null && (pointsBalance > 0 || appliedPoints > 0) && (
                    <Switch
                        checked={appliedPoints > 0}
                        onCheckedChange={handleToggleChange}
                        disabled={loading}
                    />
                )}
            </div>

            <div className="flex flex-col gap-y-3 mt-3">
                {pointsBalance === null ? (
                    <Text className="text-xs text-slate-400">Loading your balance...</Text>
                ) : pointsBalance === 0 && appliedPoints === 0 ? (
                    <Text className="text-xs text-slate-400 italic">
                        You don't have any coins available to redeem yet. Complete this purchase to start earning!
                    </Text>
                ) : (
                    <div className="flex flex-col gap-y-1.5">
                        <div className="flex justify-between items-center text-xs text-slate-500">
                            <span>Available Balance:</span>
                            <span className="font-semibold text-slate-800">
                                {pointsBalance} Coins
                            </span>
                        </div>
                        {appliedPoints > 0 && (
                            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex flex-col gap-y-0.5 mt-1 animate-fade-in">
                                <span className="text-xs font-semibold text-gray-900">
                                    Redeeming {appliedPoints} Coins
                                </span>
                                <span className="text-[10px] text-gray-500">
                                    Discount: {convertToLocale({ amount: appliedDiscount / 100, currency_code: cart.currency_code })}
                                </span>
                            </div>
                        )}
                    </div>
                )}
                <ErrorMessage error={errorMessage} />
            </div>
        </div>
    )
}

export default LoyaltyRedeem
