import { create } from 'zustand'
import { transportApi } from '../services/api'

const useTransportStore = create((set, get) => ({
  items:      [],
  total:      0,
  totalPages: 1,
  loading:    false,
  error:      null,
  _params:    {},

  setItems:   (items)   => set({ items }),
  setLoading: (loading) => set({ loading }),
  setError:   (error)   => set({ error }),

  fetch: async (params) => {
    const p = params !== undefined ? params : get()._params
    set({ loading: true, _params: p, error: null })
    try {
      const r = await transportApi.getAll(p)
      set({ items: r.data.items || [], total: r.data.total || 0, totalPages: r.data.totalPages || 1, loading: false })
    } catch (e) {
      set({ error: e.message || 'Failed to load', loading: false })
    }
  },
}))

export default useTransportStore
