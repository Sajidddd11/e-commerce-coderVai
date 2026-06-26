"use client"

import { useState, useEffect } from "react"
import { Heading, Input, Text, Button } from "@medusajs/ui"
import { retrieveLoyaltyDetails, applyLoyaltyPoints, removeLoyaltyPoints } from "@lib/data/loyalty"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import ErrorMessage from "../error-message"

type LoyaltyRedeemProps = {
    cart: HttpTypes.StoreCart
    customer: HttpTypes.StoreCustomer | null
}

const LoyaltyRedeem: React.FC<LoyaltyRedeemProps> = ({ cart, customer }) => {
    const [pointsBalance, setPointsBalance] = useState<number | null>(null)
    const [redeemInput, setRedeemInput] = useState<string>("")
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
                    🪙 Loyalty Reward Coins
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

    const handleApply = async () => {
        setErrorMessage("")
        const points = parseInt(redeemInput, 10)
        if (isNaN(points) || points <= 0) {
            setErrorMessage("Please enter a valid amount of coins.")
            return
        }

        if (pointsBalance !== null && points > pointsBalance) {
            setErrorMessage(`You only have ${pointsBalance} coins available.`)
            return
        }

        try {
            setLoading(true)
            const res = await applyLoyaltyPoints(cart.id, points)
            if (res && (res as any).error) {
                setErrorMessage((res as any).error)
            } else {
                setRedeemInput("")
                // Reload balance
                const { account } = await retrieveLoyaltyDetails()
                if (account) setPointsBalance(account.points)
            }
        } catch (err: any) {
            setErrorMessage(err.message || "Failed to apply coins")
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = async () => {
        setErrorMessage("")
        try {
            setLoading(true)
            const res = await removeLoyaltyPoints(cart.id)
            if (res && (res as any).error) {
                setErrorMessage((res as any).error)
            } else {
                // Reload balance
                const { account } = await retrieveLoyaltyDetails()
                if (account) setPointsBalance(account.points)
            }
        } catch (err: any) {
            setErrorMessage(err.message || "Failed to remove coins")
        } finally {
            setLoading(false)
        }
    }

    const handleRedeemMax = () => {
        if (pointsBalance === null) return
        setRedeemInput(String(pointsBalance))
    }

    return (
        <div className="w-full bg-white flex flex-col border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <Heading level="h3" className="txt-medium text-lg mb-2 flex items-center gap-x-1.5 text-slate-800">
                🪙 Loyalty Reward Coins
            </Heading>

            {appliedPoints > 0 ? (
                <div className="flex flex-col gap-y-3 mt-2">
                    <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-indigo-900">Applied {appliedPoints} Coins</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">
                                Discount: {convertToLocale({ amount: appliedDiscount / 100, currency_code: cart.currency_code })}
                            </span>
                        </div>
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={handleRemove}
                            isLoading={loading}
                            className="text-xs border border-slate-200 hover:bg-slate-50"
                        >
                            Remove
                        </Button>
                    </div>
                    <ErrorMessage error={errorMessage} />
                </div>
            ) : (
                <div className="flex flex-col gap-y-3 mt-2">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Available Balance:</span>
                        <span className="font-semibold text-slate-800">
                            {pointsBalance !== null ? `${pointsBalance} Coins` : "Loading..."}
                        </span>
                    </div>

                    {pointsBalance !== null && pointsBalance > 0 && (
                        <div className="flex flex-col gap-y-2">
                            <div className="flex w-full gap-x-2 items-stretch">
                                <Input
                                    className="flex-1 !h-10 text-sm"
                                    type="number"
                                    min={1}
                                    max={pointsBalance}
                                    placeholder="Enter coins to redeem"
                                    value={redeemInput}
                                    onChange={(e) => setRedeemInput(e.target.value)}
                                />
                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={handleRedeemMax}
                                    className="text-xs px-3 border border-slate-200 whitespace-nowrap"
                                >
                                    Use Max
                                </Button>
                                <Button
                                    variant="primary"
                                    size="base"
                                    onClick={handleApply}
                                    isLoading={loading}
                                    disabled={!redeemInput || loading}
                                    className="!min-h-[40px] !h-10 whitespace-nowrap px-6"
                                >
                                    Apply
                                </Button>
                            </div>
                            <ErrorMessage error={errorMessage} />
                        </div>
                    )}

                    {pointsBalance === 0 && (
                        <Text className="text-xs text-slate-400 italic">
                            You don't have any coins available to redeem yet. Complete this purchase to start earning!
                        </Text>
                    )}
                </div>
            )}
        </div>
    )
}

export default LoyaltyRedeem
