import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        localStorage.removeItem('fitdeck-auth')
      },

      updateUser: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),

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
