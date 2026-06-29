import { sdk } from "./sdk"
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

export async function listNotifications(): Promise<DbNotification[]> {
  try {
    const headers = await getAuthHeaders()
    if (!headers.authorization) return []

    const response = await sdk.client.fetch<{ notifications?: DbNotification[] }>(
      "/store/notifications",
      {
        method: "GET",
        headers,
      }
    )
    return response?.notifications ?? []
  } catch (error) {
    console.error("[Notifications API] Error fetching notifications:", error)
    return []
  }
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders()
    if (!headers.authorization) return false

    await sdk.client.fetch(`/store/notifications/${id}/read`, {
      method: "POST",
      headers,
    })
    return true
  } catch (error) {
    console.error("[Notifications API] Error marking notification as read:", error)
    return false
  }
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    const headers = await getAuthHeaders()
    if (!headers.authorization) return false

    await sdk.client.fetch("/store/notifications/read-all", {
      method: "POST",
      headers,
    })
    return true
  } catch (error) {
    console.error("[Notifications API] Error marking all notifications as read:", error)
    return false
  }
}
