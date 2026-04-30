import { create } from 'zustand'
import { analyticsApi } from '../services/api'

const useAnalyticsStore = create((set, get) => ({
  pageViews: {},   // { news: 150, events: 89, ... }
  loaded: false,
  loading: false,

  fetch: async () => {
    if (get().loading) return
    set({ loading: true })
    try {
      const res = await analyticsApi.getPageViews()
      set({ pageViews: res.data || {}, loaded: true })
    } catch {
      // non-blocking — admin works without analytics
    } finally {
      set({ loading: false })
    }
  },

  getCount: (module) => get().pageViews[module] || 0,
}))

export default useAnalyticsStore
