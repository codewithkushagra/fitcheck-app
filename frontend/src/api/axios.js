import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem('fitdeck-auth') || '{}')
  const token = auth?.state?.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes('/auth/')
    // Only force-logout on a real 401 from a protected route (expired/invalid token)
    // Never redirect on network errors (no response) or auth endpoints
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('fitdeck-auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
