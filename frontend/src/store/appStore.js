import { create } from 'zustand'

const useAppStore = create((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  notifications: [],
  addNotification: (notif) => set((state) => ({
    notifications: [{ id: Date.now(), ...notif }, ...state.notifications]
  })),
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  clearNotifications: () => set({ notifications: [] }),
}))

export default useAppStore
