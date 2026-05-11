import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Switch, Badge, Text, Toaster, toast } from "@medusajs/ui"
import { useState, useEffect } from "react"
import { BuildingStorefront, CheckCircle } from "@medusajs/icons"

const CourierSettingsPage = () => {
    const [configs, setConfigs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)

    // Pathao form state
    const [pathaoConfig, setPathaoConfig] = useState({
        base_url: "https://courier-api-sandbox.pathao.com",
        client_id: "",
        client_secret: "",
        username: "",
        password: "",
        grant_type: "password",
    })
    const [pathaoActive, setPathaoActive] = useState(false)
    const [pathaoSandbox, setPathaoSandbox] = useState(true)
    const [stores, setStores] = useState<any[]>([])
    const [fetchingStores, setFetchingStores] = useState(false)

    useEffect(() => {
        fetchConfigs()
    }, [])

    const fetchConfigs = async () => {
        try {
            setLoading(true)
            const response = await fetch("/admin/courier/config", {
                credentials: "include",
            })
            const result = await response.json()
            setConfigs(result.configs || [])

            // Load Pathao config if exists
            const pathao = result.configs?.find((c: any) => c.provider === "pathao")
            if (pathao) {
                setPathaoConfig(pathao.config)
                setPathaoActive(pathao.is_active)
                setPathaoSandbox(pathao.is_sandbox)
            }
        } catch (error) {
            console.error("Error fetching configs:", error)
            toast.error("Failed to load courier configurations")
        } finally {
            setLoading(false)
        }
    }

    const testConnection = async () => {
        try {
            setTesting(true)
            const response = await fetch("/admin/courier/test-connection", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    provider: "pathao",
                    config: pathaoConfig,
                }),
            })

            const result = await response.json()

            if (result.success) {
                toast.success(`Connected to Pathao API. Found ${result.data.stores_count} store(s).`)
            } else {
                toast.error(result.message || "Failed to connect to Pathao API")
            }
        } catch (error: any) {
            console.error("Error testing connection:", error)
            toast.error(error.message || "Failed to test connection")
        } finally {
            setTesting(false)
        }
    }

    const savePathaoConfig = async () => {
        try {
            setSaving(true)
            const response = await fetch("/admin/courier/config", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    provider: "pathao",
                    is_active: pathaoActive,
                    is_sandbox: pathaoSandbox,
                    config: pathaoConfig,
                }),
            })

            const result = await response.json()

            if (result.config) {
                toast.success("Pathao configuration saved successfully")
                fetchConfigs()
            } else {
                toast.error(result.message || "Failed to save configuration")
            }
        } catch (error: any) {
            console.error("Error saving config:", error)
            toast.error(error.message || "Failed to save configuration")
        } finally {
            setSaving(false)
        }
    }

    const useSandboxCredentials = () => {
        setPathaoConfig({
            base_url: "https://courier-api-sandbox.pathao.com",
            client_id: "7N1aMJQbWm",
            client_secret: "wRcaibZkUdSNz2EI9ZyuXLlNrnAv0TdPUPXMnD39",
            username: "test@pathao.com",
            password: "lovePathao",
            grant_type: "password",
        })
        setPathaoSandbox(true)
    }

    const fetchStores = async () => {
        try {
            setFetchingStores(true)
            const response = await fetch("/admin/courier/pathao/stores", {
                credentials: "include",
            })
            const result = await response.json()

            if (result.api_stores && result.api_stores.length > 0) {
                setStores(result.api_stores)
                toast.success(`Found ${result.api_stores.length} store(s) from Pathao`)

                // Auto-save first store as default if no stores exist locally
                if (!result.local_stores || result.local_stores.length === 0) {
                    await saveStore(result.api_stores[0], true)
                }
            } else {
                toast.error("No stores found in your Pathao account")
            }
        } catch (error: any) {
            console.error("Error fetching stores:", error)
            toast.error(error.message || "Failed to fetch stores")
        } finally {
            setFetchingStores(false)
        }
    }

    const saveStore = async (store: any, isDefault: boolean = false) => {
        try {
            const response = await fetch("/admin/courier/pathao/stores", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    store_id: store.store_id,
                    store_name: store.store_name,
                    contact_name: store.contact_name,
                    contact_number: store.contact_number,
                    address: store.address,
                    city_id: store.city_id,
                    zone_id: store.zone_id,
                    area_id: store.area_id,
                    is_default: isDefault,
                }),
            })

            const result = await response.json()
            if (result.store) {
                toast.success(isDefault ? "Default store configured successfully" : "Store saved successfully")
            } else {
                toast.error(result.message || "Failed to save store")
            }
        } catch (error: any) {
            console.error("Error saving store:", error)
            toast.error(error.message || "Failed to save store")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Text className="text-ui-fg-subtle">Loading...</Text>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-y-4">
            <Toaster />

            <div className="flex items-center gap-2">
                <BuildingStorefront className="text-ui-fg-subtle" />
                <Heading level="h1">Courier Integration Settings</Heading>
            </div>

            <Text className="text-ui-fg-subtle">
                Configure courier service credentials to enable automated shipment creation and tracking.
            </Text>

            {/* Pathao Configuration */}
            <Container className="divide-y p-0">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Heading level="h2">Pathao Courier</Heading>
                        {configs.find((c) => c.provider === "pathao")?.is_active && (
                            <Badge color="green">
                                <CheckCircle />
                                Active
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Text size="small" className="text-ui-fg-subtle">
                            Enable
                        </Text>
                        <Switch
                            checked={pathaoActive}
                            onCheckedChange={setPathaoActive}
                        />
                    </div>
                </div>

                <div className="px-6 py-4 space-y-4">
                    {/* Environment Toggle */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Text size="small" className="text-ui-fg-subtle">
                                Sandbox Mode
                            </Text>
                            <Switch
                                checked={pathaoSandbox}
                                onCheckedChange={setPathaoSandbox}
                            />
                        </div>
                        {pathaoSandbox && (
                            <Button
                                size="small"
                                variant="transparent"
                                onClick={useSandboxCredentials}
                            >
                                Use Sandbox Credentials
                            </Button>
                        )}
                    </div>

                    {/* API URL */}
                    <div className="space-y-2">
                        <Text size="small" weight="plus">
                            API Base URL
                        </Text>
                        <Input
                            type="text"
                            placeholder="https://courier-api-sandbox.pathao.com"
                            value={pathaoConfig.base_url}
                            onChange={(e) =>
                                setPathaoConfig({ ...pathaoConfig, base_url: e.target.value })
                            }
                        />
                    </div>

                    {/* Client ID */}
                    <div className="space-y-2">
                        <Text size="small" weight="plus">
                            Client ID
                        </Text>
                        <Input
                            type="text"
                            placeholder="Enter client ID"
                            value={pathaoConfig.client_id}
                            onChange={(e) =>
                                setPathaoConfig({ ...pathaoConfig, client_id: e.target.value })
                            }
                        />
                    </div>

                    {/* Client Secret */}
                    <div className="space-y-2">
                        <Text size="small" weight="plus">
                            Client Secret
                        </Text>
                        <Input
                            type="password"
                            placeholder="Enter client secret"
                            value={pathaoConfig.client_secret}
                            onChange={(e) =>
                                setPathaoConfig({ ...pathaoConfig, client_secret: e.target.value })
                            }
                        />
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                        <Text size="small" weight="plus">
                            Username (Email)
                        </Text>
                        <Input
                            type="email"
                            placeholder="your@email.com"
                            value={pathaoConfig.username}
                            onChange={(e) =>
                                setPathaoConfig({ ...pathaoConfig, username: e.target.value })
                            }
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Text size="small" weight="plus">
                            Password
                        </Text>
                        <Input
                            type="password"
                            placeholder="Enter password"
                            value={pathaoConfig.password}
                            onChange={(e) =>
                                setPathaoConfig({ ...pathaoConfig, password: e.target.value })
                            }
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="secondary"
                            onClick={testConnection}
                            isLoading={testing}
                        >
                            Test Connection
                        </Button>
                        <Button onClick={savePathaoConfig} isLoading={saving}>
                            Save Configuration
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={fetchStores}
                            isLoading={fetchingStores}
                        >
                            Fetch & Save Stores
                        </Button>
                    </div>

                    {/* Stores List */}
                    {stores.length > 0 && (
                        <div className="pt-4 space-y-2">
                            <Text size="small" weight="plus">
                                Available Stores ({stores.length})
                            </Text>
                            <div className="space-y-2">
                                {stores.map((store: any) => (
                                    <div
                                        key={store.store_id}
                                        className="flex items-center justify-between p-3 border border-ui-border-base rounded-lg"
                                    >
                                        <div>
                                            <Text weight="plus">{store.store_name}</Text>
                                            <Text size="small" className="text-ui-fg-subtle">
                                                Store ID: {store.store_id}
                                            </Text>
                                        </div>
                                        <Button
                                            size="small"
                                            variant="secondary"
                                            onClick={() => saveStore(store, true)}
                                        >
                                            Set as Default
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Container>

            {/* Future Couriers Placeholder */}
            <Container className="divide-y p-0">
                <div className="px-6 py-4">
                    <Heading level="h2">Other Couriers</Heading>
                </div>
                <div className="px-6 py-8 text-center">
                    <Text className="text-ui-fg-muted">
                        More courier integrations coming soon...
                    </Text>
                    <Text size="small" className="text-ui-fg-subtle mt-2">
                        (Steadfast, RedX, PaperFly, etc.)
                    </Text>
                </div>
            </Container>
        </div>
    )
}

export const config = defineRouteConfig({
    label: "Courier Settings",
    icon: BuildingStorefront,
})

export default CourierSettingsPage
