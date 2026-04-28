import axios from 'axios'
import { getToken } from 'firebase/app-check'
import { auth, appCheck } from '../utils/firebase'
import { API_BASE_URL } from '../utils/constants'

const api = axios.create({ baseURL: API_BASE_URL })

api.interceptors.request.use(async (config) => {
  // Auth token — forceRefresh ensures expired tokens are never sent
  const token = await auth.currentUser?.getIdToken(true).catch(() => null)
  if (token) config.headers.Authorization = `Bearer ${token}`

  // App Check token — non-blocking; if unavailable the request still goes through
  // (backend enforces in production, skips in development)
  try {
    const { token: acToken } = await getToken(appCheck, false)
    if (acToken) config.headers['X-Firebase-AppCheck'] = acToken
  } catch { /* non-blocking */ }

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
