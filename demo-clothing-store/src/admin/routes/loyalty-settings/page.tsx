import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Label, Text } from "@medusajs/ui"
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

    useEffect(() => {
        fetchSettings()
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

    return (
        <div className="flex flex-col gap-y-6">
            {/* Page Header */}
            <div>
                <Heading level="h1" className="text-2xl font-bold text-ui-fg-base">
                    Zahan Coins
                </Heading>
                <Text className="text-ui-fg-subtle mt-1 text-sm">
                    Configure your storefront's dynamic coin reward and redemption rules.
                </Text>
            </div>

            {/* Config Card */}
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
    )
}

export const config = defineRouteConfig({
    label: "Zahan Coins",
    icon: CheckCircle, // Re-using standard icon
})

export default LoyaltySettingsPage
