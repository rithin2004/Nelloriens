import axios from 'axios'
import { auth } from '../utils/firebase'
import { API_BASE_URL } from '../utils/constants'

const api = axios.create({ baseURL: API_BASE_URL })

api.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.message || 'Request failed'
    return Promise.reject(new Error(msg))
  }
)

export default api
