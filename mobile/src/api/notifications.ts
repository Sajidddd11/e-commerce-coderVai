import { MEDUSA_BACKEND, PUBLISHABLE_KEY } from "./sdk"
import { getAuthHeaders } from "@utils/storage"

export interface DbNotification {
  id: string
  customer_id: string
  title: string
  message: string
  order_id: string | null
  type: string
  status: "unread" | "read"
  created_at: string
  updated_at: string
}

/**
 * Build the standard headers for authenticated store API calls.
 * Uses native fetch instead of sdk.client.fetch so we can inspect
 * the raw response and get accurate error messages.
 */
async function buildHeaders(): Promise<Record<string, string>> {
  const auth = await getAuthHeaders()
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "x-publishable-api-key": PUBLISHABLE_KEY ?? "",
    ...auth,
  }
}

export async function listNotifications(): Promise<DbNotification[]> {
  try {
    const headers = await buildHeaders()
    if (!headers.authorization) return []

    const res = await fetch(`${MEDUSA_BACKEND}/store/notifications`, {
      method: "GET",
      headers,
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      console.error(
        `[Notifications API] listNotifications failed — HTTP ${res.status}:`,
        body
      )
      return []
    }

    const data = await res.json()
    return data?.notifications ?? []
  } catch (error) {
    console.error("[Notifications API] Error fetching notifications:", error)
    return []
  }
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  try {
    const headers = await buildHeaders()
    if (!headers.authorization) return false

    const res = await fetch(
      `${MEDUSA_BACKEND}/store/notifications/${id}/read`,
      {
        method: "POST",
        headers,
      }
    )

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      console.error(
        `[Notifications API] markNotificationAsRead failed — HTTP ${res.status}:`,
        JSON.stringify(body)
      )
      return false
    }

    return true
  } catch (error) {
    console.error("[Notifications API] Error marking notification as read:", error)
    return false
  }
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    const headers = await buildHeaders()
    if (!headers.authorization) return false

    const res = await fetch(`${MEDUSA_BACKEND}/store/notifications/read-all`, {
      method: "POST",
      headers,
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      console.error(
        `[Notifications API] markAllNotificationsAsRead failed — HTTP ${res.status}:`,
        JSON.stringify(body)
      )
      return false
    }

    return true
  } catch (error) {
    console.error("[Notifications API] Error marking all notifications as read:", error)
    return false
  }
}
