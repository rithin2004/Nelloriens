import { create } from 'zustand'
import { recycleBinApi } from '../services/api'

const useRecycleBinStore = create((set, get) => ({
  items:      [],
  total:      0,
  totalPages: 1,
  loading:    false,
  error:      null,
  _params:    {},
  // Stats: { total, byModule }
  stats:         null,
  statsLoading:  false,

  setItems:   (items)   => set({ items }),
  setLoading: (loading) => set({ loading }),
  setError:   (error)   => set({ error }),

  fetch: async (params) => {
    const p = params !== undefined ? params : get()._params
    set({ loading: true, _params: p, error: null })
    try {
      const r = await recycleBinApi.list(p)
      set({ items: r.data.items || [], total: r.data.total || 0, totalPages: r.data.totalPages || 1, loading: false })
    } catch (e) {
      set({ error: e.message || 'Failed to load', loading: false })
    }
  },

  fetchStats: async () => {
    set({ statsLoading: true })
    try {
      const r = await recycleBinApi.stats()
      set({ stats: r.data.data || r.data || null, statsLoading: false })
    } catch {
      set({ statsLoading: false })
    }
  },
}))

export default useRecycleBinStore
