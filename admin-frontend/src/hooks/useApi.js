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
    if (err.response?.status === 401) {
      const msg = err.response?.data?.message || ''
      // App Check rejections are non-fatal — do not sign the user out.
      // They happen on first request after login when the token isn't ready yet.
      if (!msg.includes('App Check')) {
        await auth.signOut().catch(() => {})
      }
    }
    // Normalize the message while preserving err.response so catch blocks can
    // still read err.response.data.code (e.g. MAX_LIMIT_REACHED prompts).
    err.message = err.response?.data?.message || err.message || 'Request failed'
    return Promise.reject(err)
  }
)

export default api
