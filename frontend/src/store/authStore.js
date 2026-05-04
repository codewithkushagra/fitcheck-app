import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api/axios'

// Read persisted auth synchronously before store initializes
// This prevents the race condition where React renders before Zustand hydrates
function getPersistedAuth() {
  try {
    const raw = localStorage.getItem('fitdeck-auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed?.state || {}
    }
  } catch {}
  return {}
}

const persisted = getPersistedAuth()

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: persisted.user || null,
      token: persisted.token || null,
      isAuthenticated: persisted.isAuthenticated || false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        localStorage.removeItem('fitdeck-auth')
      },

      updateUser: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),

      refreshUser: async () => {
        try {
          const res = await api.get('/auth/me')
          const fresh = res.data.user
          set((state) => ({ user: { ...state.user, ...fresh } }))
          return fresh
        } catch {
          return null
        }
      },

      get role() {
        return get().user?.role || null
      },

      get isAdmin() {
        return get().user?.role === 'gym_admin'
      },

      get isTrainer() {
        return get().user?.role === 'trainer'
      },

      get isClient() {
        return get().user?.role === 'end_user'
      },

      get isPremium() {
        return get().user?.subscription === 'premium'
      },
    }),
    {
      name: 'fitdeck-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
