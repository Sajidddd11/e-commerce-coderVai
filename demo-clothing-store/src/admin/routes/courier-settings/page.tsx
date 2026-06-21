import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
    Container,
    Heading,
    Button,
    Input,
    Switch,
    Badge,
    Text,
    Toaster,
    toast,
} from "@medusajs/ui"
import { useState, useEffect } from "react"
import { BuildingStorefront, CheckCircle, Spinner } from "@medusajs/icons"

// ─── types ────────────────────────────────────────────────────────────────────

interface CourierConfig {
    provider: string
    is_active: boolean
    is_sandbox: boolean
    config: Record<string, any>
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const apiFetch = (url: string, init?: RequestInit) =>
    fetch(url, { credentials: "include", ...init })

// ─── component ────────────────────────────────────────────────────────────────

const CourierSettingsPage = () => {
    const [configs, setConfigs] = useState<CourierConfig[]>([])
    const [activeProvider, setActiveProvider] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [switchingTo, setSwitchingTo] = useState<string | null>(null)

    // ── Pathao state ──────────────────────────────────────────────────────────
    const [pathaoConfig, setPathaoConfig] = useState({
        base_url: "https://courier-api-sandbox.pathao.com",
        client_id: "",
        client_secret: "",
        username: "",
        password: "",
        grant_type: "password",
    })
    const [pathaoSandbox, setPathaoSandbox] = useState(true)
    const [pathaoSaving, setPathaoSaving] = useState(false)
    const [pathaoTesting, setPathaoTesting] = useState(false)
    const [stores, setStores] = useState<any[]>([])
    const [fetchingStores, setFetchingStores] = useState(false)

    // ── Steadfast state ───────────────────────────────────────────────────────
    const [steadfastConfig, setSteadfastConfig] = useState({
        api_key: "",
        secret_key: "",
    })
    const [steadfastSaving, setSteadfastSaving] = useState(false)
    const [steadfastTesting, setSteadfastTesting] = useState(false)

    // ── bootstrap ─────────────────────────────────────────────────────────────

    useEffect(() => {
        fetchAll()
    }, [])

    const fetchAll = async () => {
        try {
            setLoading(true)
            const [cfgRes, activeRes] = await Promise.all([
                apiFetch("/admin/courier/config"),
                apiFetch("/admin/courier/active"),
            ])
            const { configs: cfgList } = await cfgRes.json()
            const { provider } = await activeRes.json()

            setConfigs(cfgList || [])
            setActiveProvider(provider)

            const pathao = cfgList?.find((c: CourierConfig) => c.provider === "pathao")
            if (pathao) {
                setPathaoConfig(pathao.config)
                setPathaoSandbox(pathao.is_sandbox)
            }

            const steadfast = cfgList?.find((c: CourierConfig) => c.provider === "steadfast")
            if (steadfast) {
                setSteadfastConfig(steadfast.config)
            }
        } catch (err) {
            console.error(err)
            toast.error("Failed to load courier configurations")
        } finally {
            setLoading(false)
        }
    }

    // ── active switcher ───────────────────────────────────────────────────────

    const switchActive = async (provider: string) => {
        try {
            setSwitchingTo(provider)
            const res = await apiFetch("/admin/courier/active", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider }),
            })
            const result = await res.json()
            if (res.ok) {
                setActiveProvider(provider)
                setConfigs(prev =>
                    prev.map(c => ({ ...c, is_active: c.provider === provider }))
                )
                toast.success(result.message)
            } else {
                toast.error(result.message || "Failed to switch courier")
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to switch courier")
        } finally {
            setSwitchingTo(null)
        }
    }

    // ── Pathao helpers ────────────────────────────────────────────────────────

    const testPathao = async () => {
        try {
            setPathaoTesting(true)
            const res = await apiFetch("/admin/courier/test-connection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider: "pathao", config: pathaoConfig }),
            })
            const result = await res.json()
            if (result.success) {
                toast.success(`Connected to Pathao. Found ${result.data.stores_count} store(s).`)
            } else {
                toast.error(result.message || "Failed to connect to Pathao")
            }
        } catch (err: any) {
            toast.error(err.message || "Connection failed")
        } finally {
            setPathaoTesting(false)
        }
    }

    const savePathao = async () => {
        try {
            setPathaoSaving(true)
            const res = await apiFetch("/admin/courier/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: "pathao",
                    is_active: activeProvider === "pathao",
                    is_sandbox: pathaoSandbox,
                    config: pathaoConfig,
                }),
            })
            const result = await res.json()
            if (result.config) {
                toast.success("Pathao configuration saved")
                fetchAll()
            } else {
                toast.error(result.message || "Failed to save Pathao configuration")
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to save")
        } finally {
            setPathaoSaving(false)
        }
    }

    const useSandboxCreds = () => {
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
            const res = await apiFetch("/admin/courier/pathao/stores")
            const result = await res.json()
            if (result.api_stores?.length > 0) {
                setStores(result.api_stores)
                toast.success(`Found ${result.api_stores.length} store(s) from Pathao`)
                if (!result.local_stores?.length) {
                    await saveStore(result.api_stores[0], true)
                }
            } else {
                toast.error("No stores found in your Pathao account")
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to fetch stores")
        } finally {
            setFetchingStores(false)
        }
    }

    const saveStore = async (store: any, isDefault = false) => {
        try {
            const res = await apiFetch("/admin/courier/pathao/stores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...store, is_default: isDefault }),
            })
            const result = await res.json()
            if (result.store) {
                toast.success(isDefault ? "Default store configured" : "Store saved")
            } else {
                toast.error(result.message || "Failed to save store")
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to save store")
        }
    }

    // ── Steadfast helpers ─────────────────────────────────────────────────────

    const testSteadfast = async () => {
        try {
            setSteadfastTesting(true)
            const res = await apiFetch("/admin/courier/test-connection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider: "steadfast", config: steadfastConfig }),
            })
            const result = await res.json()
            if (result.success) {
                toast.success(
                    `Connected to Steadfast. Balance: ৳${result.data?.current_balance ?? 0}`
                )
            } else {
                toast.error(result.message || "Failed to connect to Steadfast")
            }
        } catch (err: any) {
            toast.error(err.message || "Connection failed")
        } finally {
            setSteadfastTesting(false)
        }
    }

    const saveSteadfast = async () => {
        try {
            setSteadfastSaving(true)
            const res = await apiFetch("/admin/courier/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: "steadfast",
                    is_active: activeProvider === "steadfast",
                    is_sandbox: false, // Steadfast is always live
                    config: steadfastConfig,
                }),
            })
            const result = await res.json()
            if (result.config) {
                toast.success("Steadfast configuration saved")
                fetchAll()
            } else {
                toast.error(result.message || "Failed to save Steadfast configuration")
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to save")
        } finally {
            setSteadfastSaving(false)
        }
    }

    // ── render ────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full py-20">
                <Text className="text-ui-fg-subtle">Loading...</Text>
            </div>
        )
    }

    const isPathaoConfigured = configs.some(c => c.provider === "pathao")
    const isSteadfastConfigured = configs.some(c => c.provider === "steadfast")

    return (
        <div className="flex flex-col gap-y-4">
            <Toaster />

            {/* ── Page header ── */}
            <div className="flex items-center gap-2">
                <BuildingStorefront className="text-ui-fg-subtle" />
                <Heading level="h1">Courier Integration Settings</Heading>
            </div>

            <Text className="text-ui-fg-subtle">
                Configure courier credentials and select which provider handles new shipments.
            </Text>

            {/* ── Active courier banner ── */}
            <Container className="p-0">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <Text weight="plus">Active Courier</Text>
                        <Text size="small" className="text-ui-fg-subtle mt-0.5">
                            All new shipments will be sent through this provider.
                        </Text>
                    </div>
                    <div className="flex items-center gap-3">
                        {activeProvider ? (
                            <Badge color="green" className="capitalize">
                                <CheckCircle />
                                {activeProvider}
                            </Badge>
                        ) : (
                            <Badge color="orange">None selected</Badge>
                        )}
                    </div>
                </div>

                {/* Quick-switch buttons */}
                <div className="border-t border-ui-border-base px-6 py-3 flex gap-2">
                    {["pathao", "steadfast"].map(provider => {
                        const configured = provider === "pathao" ? isPathaoConfigured : isSteadfastConfigured
                        const isActive = activeProvider === provider
                        const switching = switchingTo === provider
                        return (
                            <Button
                                key={provider}
                                size="small"
                                variant={isActive ? "primary" : "secondary"}
                                onClick={() => !isActive && configured && switchActive(provider)}
                                disabled={!configured || isActive || !!switchingTo}
                                className="capitalize"
                            >
                                {switching && <Spinner className="mr-1 animate-spin" />}
                                {isActive ? `✓ ${provider} (active)` : `Use ${provider}`}
                            </Button>
                        )
                    })}
                    {!isPathaoConfigured && !isSteadfastConfigured && (
                        <Text size="small" className="text-ui-fg-muted self-center">
                            Save at least one provider below to activate it.
                        </Text>
                    )}
                </div>
            </Container>

            {/* ── Pathao Configuration ── */}
            <Container className="divide-y p-0">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Heading level="h2">Pathao Courier</Heading>
                        {activeProvider === "pathao" && (
                            <Badge color="green">
                                <CheckCircle />
                                Active
                            </Badge>
                        )}
                        {isPathaoConfigured && activeProvider !== "pathao" && (
                            <Badge color="grey">Configured</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Text size="small" className="text-ui-fg-subtle">Sandbox</Text>
                        <Switch
                            checked={pathaoSandbox}
                            onCheckedChange={(v) => {
                                setPathaoSandbox(v)
                                setPathaoConfig(prev => ({
                                    ...prev,
                                    base_url: v
                                        ? "https://courier-api-sandbox.pathao.com"
                                        : "https://courier-api.pathao.com",
                                }))
                            }}
                        />
                    </div>
                </div>

                <div className="px-6 py-4 space-y-4">
                    {pathaoSandbox && (
                        <div>
                            <Button size="small" variant="transparent" onClick={useSandboxCreds}>
                                Fill Sandbox Credentials
                            </Button>
                        </div>
                    )}

                    {/* API URL */}
                    <div className="space-y-1">
                        <Text size="small" weight="plus">API Base URL</Text>
                        <Input
                            value={pathaoConfig.base_url}
                            onChange={e => setPathaoConfig({ ...pathaoConfig, base_url: e.target.value })}
                            placeholder="https://courier-api-sandbox.pathao.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Text size="small" weight="plus">Client ID</Text>
                            <Input
                                value={pathaoConfig.client_id}
                                onChange={e => setPathaoConfig({ ...pathaoConfig, client_id: e.target.value })}
                                placeholder="Client ID"
                            />
                        </div>
                        <div className="space-y-1">
                            <Text size="small" weight="plus">Client Secret</Text>
                            <Input
                                type="password"
                                value={pathaoConfig.client_secret}
                                onChange={e => setPathaoConfig({ ...pathaoConfig, client_secret: e.target.value })}
                                placeholder="Client Secret"
                            />
                        </div>
                        <div className="space-y-1">
                            <Text size="small" weight="plus">Username (Email)</Text>
                            <Input
                                type="email"
                                value={pathaoConfig.username}
                                onChange={e => setPathaoConfig({ ...pathaoConfig, username: e.target.value })}
                                placeholder="your@email.com"
                            />
                        </div>
                        <div className="space-y-1">
                            <Text size="small" weight="plus">Password</Text>
                            <Input
                                type="password"
                                value={pathaoConfig.password}
                                onChange={e => setPathaoConfig({ ...pathaoConfig, password: e.target.value })}
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button variant="secondary" onClick={testPathao} isLoading={pathaoTesting}>
                            Test Connection
                        </Button>
                        <Button onClick={savePathao} isLoading={pathaoSaving}>
                            Save Configuration
                        </Button>
                        <Button variant="secondary" onClick={fetchStores} isLoading={fetchingStores}>
                            Fetch &amp; Save Stores
                        </Button>
                    </div>

                    {/* Stores list */}
                    {stores.length > 0 && (
                        <div className="pt-2 space-y-2">
                            <Text size="small" weight="plus">Available Stores ({stores.length})</Text>
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

            {/* ── Steadfast Configuration ── */}
            <Container className="divide-y p-0">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Heading level="h2">Steadfast Courier</Heading>
                        {activeProvider === "steadfast" && (
                            <Badge color="green">
                                <CheckCircle />
                                Active
                            </Badge>
                        )}
                        {isSteadfastConfigured && activeProvider !== "steadfast" && (
                            <Badge color="grey">Configured</Badge>
                        )}
                    </div>
                    <Badge color="blue">Live</Badge>
                </div>

                <div className="px-6 py-4 space-y-4">
                    <Text size="small" className="text-ui-fg-subtle">
                        Steadfast uses API Key authentication. Credentials are available from your{" "}
                        <a
                            href="https://portal.packzy.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-ui-fg-interactive underline"
                        >
                            Steadfast merchant portal
                        </a>
                        .
                    </Text>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Text size="small" weight="plus">API Key</Text>
                            <Input
                                value={steadfastConfig.api_key}
                                onChange={e => setSteadfastConfig({ ...steadfastConfig, api_key: e.target.value })}
                                placeholder="Your Steadfast API Key"
                            />
                        </div>
                        <div className="space-y-1">
                            <Text size="small" weight="plus">Secret Key</Text>
                            <Input
                                type="password"
                                value={steadfastConfig.secret_key}
                                onChange={e => setSteadfastConfig({ ...steadfastConfig, secret_key: e.target.value })}
                                placeholder="Your Steadfast Secret Key"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button variant="secondary" onClick={testSteadfast} isLoading={steadfastTesting}>
                            Test Connection
                        </Button>
                        <Button onClick={saveSteadfast} isLoading={steadfastSaving}>
                            Save Configuration
                        </Button>
                    </div>
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
