import useAuthStore from '../store/authStore'

export const useAuth = () => {
  const store = useAuthStore()
  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isAdmin: store.user?.role === 'gym_admin',
    isTrainer: store.user?.role === 'trainer',
    isClient: store.user?.role === 'end_user',
    isPremium: store.user?.subscription === 'premium',
    logout: store.logout,
    setAuth: store.setAuth,
  }
}
