import axios from 'axios'
import { auth } from '../utils/firebase'
import { API_BASE_URL } from '../utils/constants'

const api = axios.create({ baseURL: API_BASE_URL })

api.interceptors.request.use(async (config) => {
  // forceRefresh=true re-fetches the token from Firebase if it is expired or
  // about to expire, so a stale cached token never reaches the backend.
  const token = await auth.currentUser?.getIdToken(/* forceRefresh */ true).catch(() => null)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    // 401 means the token was rejected server-side (revoked, invalid, etc.)
    // Sign the user out so they land on the login page instead of getting
    // stuck in a broken authenticated state.
    if (err.response?.status === 401) {
      await auth.signOut().catch(() => {})
      // Let the onAuthStateChanged listener in AuthContext clear the user state
      // and the ProtectedRoute redirect to /login.
    }
    const msg = err.response?.data?.message || err.message || 'Request failed'
    return Promise.reject(new Error(msg))
  }
)

export default api
