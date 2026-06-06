import { useEffect, useState } from "react"
import { useRegionStore } from "@stores/region-store"
import { useCartStore } from "@stores/cart-store"
import { useAuthStore } from "@stores/auth-store"

/**
 * App startup sequence:
 *   1. Load regions + resolve default country (bd)
 *   2. Refresh cart from stored cart id
 *   3. Load customer from stored JWT
 */
export function useBootstrap() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initRegion = useRegionStore((s) => s.init)
  const refreshCart = useCartStore((s) => s.refresh)
  const loadCustomer = useAuthStore((s) => s.load)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await initRegion()
        // Cart + customer can load in parallel after region is known
        await Promise.allSettled([refreshCart(), loadCustomer()])
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Failed to start app")
      } finally {
        if (mounted) setReady(true)
      }
    })()
    return () => {
      mounted = false
    }
  }, [initRegion, refreshCart, loadCustomer])

  return { ready, error }
}
