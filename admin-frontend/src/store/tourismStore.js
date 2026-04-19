import { create } from 'zustand'
import { tourismApi } from '../services/api'

const useTourismStore = create((set, get) => ({
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
      const r = await tourismApi.getAll(p)
      set({ items: r.data.data || [], total: r.data.pagination?.total || 0, totalPages: r.data.pagination?.totalPages || 1, loading: false })
    } catch (e) {
      set({ error: e.message || 'Failed to load', loading: false })
    }
  },
}))

export default useTourismStore
