import { create } from "zustand"
import {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  DbNotification,
} from "@api/notifications"

interface NotificationState {
  notifications: DbNotification[]
  unreadCount: number
  loading: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  clear: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true })
    try {
      const notifications = await listNotifications()
      const unreadCount = notifications.filter((n) => n.status === "unread").length
      set({ notifications, unreadCount })
    } catch (e) {
      console.error("[Notification Store] Error fetching notifications:", e)
    } finally {
      set({ loading: false })
    }
  },

  markAsRead: async (id) => {
    // Update locally immediately for responsiveness (optimistic update)
    const currentList = get().notifications
    const updatedList = currentList.map((n) =>
      n.id === id ? { ...n, status: "read" as const } : n
    )
    const unreadCount = updatedList.filter((n) => n.status === "unread").length
    set({ notifications: updatedList, unreadCount })

    // Call API in the background
    const success = await markNotificationAsRead(id)
    if (!success) {
      // Revert if API failed
      const revertedList = currentList.map((n) =>
        n.id === id ? n : n
      )
      const revertedUnreadCount = revertedList.filter((n) => n.status === "unread").length
      set({ notifications: revertedList, unreadCount: revertedUnreadCount })
    }
  },

  markAllAsRead: async () => {
    // Update locally immediately (optimistic update)
    const currentList = get().notifications
    const updatedList = currentList.map((n) => ({ ...n, status: "read" as const }))
    set({ notifications: updatedList, unreadCount: 0 })

    // Call API in the background
    const success = await markAllNotificationsAsRead()
    if (!success) {
      // Revert if API failed
      const revertedUnreadCount = currentList.filter((n) => n.status === "unread").length
      set({ notifications: currentList, unreadCount: revertedUnreadCount })
    }
  },

  clear: () => {
    set({ notifications: [], unreadCount: 0, loading: false })
  },
}))
