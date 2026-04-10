import api from '../hooks/useApi'

// ── News ───────────────────────────────────────────────────────────────────
export const newsApi = {
  getAll: (params) => api.get('/news', { params }),
  getById: (id) => api.get(`/news/${id}`),
  create: (data) => api.post('/news', data),
  update: (id, data) => api.put(`/news/${id}`, data),
  delete: (id) => api.delete(`/news/${id}`),
  bulkDelete: (ids) => api.post('/news/bulk-delete', { ids }),
  bulkPublish: (ids) => api.post('/news/bulk-publish', { ids }),
  getCategories: () => api.get('/news/categories'),
  createCategory: (data) => api.post('/news/categories', data),
  updateCategory: (id, data) => api.put(`/news/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/news/categories/${id}`),
  // Breaking news points
  getBreakingPoints: () => api.get('/news/breaking-points'),
  createBreakingPoint: (data) => api.post('/news/breaking-points', data),
  updateBreakingPoint: (id, data) => api.put(`/news/breaking-points/${id}`, data),
  deleteBreakingPoint: (id) => api.delete(`/news/breaking-points/${id}`),
  reorderBreakingPoints: (items) => api.patch('/news/breaking-points/reorder', { items }),
}

// ── Jobs ───────────────────────────────────────────────────────────────────
export const jobsApi = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getCategories: () => api.get('/jobs/categories'),
  createCategory: (data) => api.post('/jobs/categories', data),
  updateCategory: (id, data) => api.put(`/jobs/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/jobs/categories/${id}`),
  getLocations: () => api.get('/jobs/locations'),
  createLocation: (data) => api.post('/jobs/locations', data),
  updateLocation: (id, data) => api.put(`/jobs/locations/${id}`, data),
  deleteLocation: (id) => api.delete(`/jobs/locations/${id}`),
}

// ── Results ────────────────────────────────────────────────────────────────
export const resultsApi = {
  getAll: (params) => api.get('/results', { params }),
  getById: (id) => api.get(`/results/${id}`),
  create: (data) => api.post('/results', data),
  update: (id, data) => api.put(`/results/${id}`, data),
  delete: (id) => api.delete(`/results/${id}`),
  getCategories: () => api.get('/results/categories'),
  createCategory: (data) => api.post('/results/categories', data),
  updateCategory: (id, data) => api.put(`/results/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/results/categories/${id}`),
}

// ── Sports ─────────────────────────────────────────────────────────────────
export const sportsApi = {
  getAll: (params) => api.get('/sports', { params }),
  getById: (id) => api.get(`/sports/${id}`),
  create: (data) => api.post('/sports', data),
  update: (id, data) => api.put(`/sports/${id}`, data),
  delete: (id) => api.delete(`/sports/${id}`),
  getCategories: () => api.get('/sports/categories'),
  createCategory: (data) => api.post('/sports/categories', data),
  updateCategory: (id, data) => api.put(`/sports/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/sports/categories/${id}`),
}

// ── Foods ──────────────────────────────────────────────────────────────────
export const foodsApi = {
  getAll: (params) => api.get('/foods', { params }),
  getById: (id) => api.get(`/foods/${id}`),
  create: (data) => api.post('/foods', data),
  update: (id, data) => api.put(`/foods/${id}`, data),
  delete: (id) => api.delete(`/foods/${id}`),
  // Photos (ordered, max 5)
  getPhotos: ()          => api.get('/foods/photos'),
  addPhoto: (data)       => api.post('/foods/photos', data),
  deletePhoto: (id)      => api.delete(`/foods/photos/${id}`),
  reorderPhotos: (items) => api.patch('/foods/photos/reorder', { items }),
  // Varieties
  getVarieties: ()           => api.get('/foods/varieties'),
  createVariety: (data)      => api.post('/foods/varieties', data),
  updateVariety: (id, data)  => api.put(`/foods/varieties/${id}`, data),
  deleteVariety: (id)        => api.delete(`/foods/varieties/${id}`),
  // Sweets (max 8)
  getSweets: ()           => api.get('/foods/sweets'),
  createSweet: (data)     => api.post('/foods/sweets', data),
  updateSweet: (id, data) => api.put(`/foods/sweets/${id}`, data),
  deleteSweet: (id)       => api.delete(`/foods/sweets/${id}`),
}

// ── History ────────────────────────────────────────────────────────────────
export const historyApi = {
  getAll: (params) => api.get('/history', { params }),
  getById: (id) => api.get(`/history/${id}`),
  create: (data) => api.post('/history', data),
  update: (id, data) => api.put(`/history/${id}`, data),
  delete: (id) => api.delete(`/history/${id}`),
  reorder: (items) => api.patch('/history/reorder', { items }),
}

// ── Stays ──────────────────────────────────────────────────────────────────
export const staysApi = {
  getAll: (params) => api.get('/stays', { params }),
  getById: (id) => api.get(`/stays/${id}`),
  create: (data) => api.post('/stays', data),
  update: (id, data) => api.put(`/stays/${id}`, data),
  delete: (id) => api.delete(`/stays/${id}`),
}

// ── Events ─────────────────────────────────────────────────────────────────
export const eventsApi = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getCategories: () => api.get('/events/categories'),
  createCategory: (data) => api.post('/events/categories', data),
  updateCategory: (id, data) => api.put(`/events/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/events/categories/${id}`),
}

// ── Movies ─────────────────────────────────────────────────────────────────
export const moviesApi = {
  getAll:  (params) => api.get('/movies', { params }),
  getById: (id)     => api.get(`/movies/${id}`),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`),
  getTheatres: () => api.get('/theatres'),
  createTheatre: (data) => api.post('/theatres', data),
  updateTheatre: (id, data) => api.put(`/theatres/${id}`, data),
  deleteTheatre: (id) => api.delete(`/theatres/${id}`),
}

// ── Transport ──────────────────────────────────────────────────────────────
export const transportApi = {
  getAll: (params) => api.get('/transport', { params }),
  getById: (id) => api.get(`/transport/${id}`),
  create: (data) => api.post('/transport', data),
  update: (id, data) => api.put(`/transport/${id}`, data),
  delete: (id) => api.delete(`/transport/${id}`),
  getCategories: () => api.get('/transport/categories'),
  createCategory: (data) => api.post('/transport/categories', data),
  updateCategory: (id, data) => api.put(`/transport/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/transport/categories/${id}`),
}

// ── Offers ─────────────────────────────────────────────────────────────────
export const offersApi = {
  getAll: (params) => api.get('/offers', { params }),
  getById: (id) => api.get(`/offers/${id}`),
  create: (data) => api.post('/offers', data),
  update: (id, data) => api.put(`/offers/${id}`, data),
  delete: (id) => api.delete(`/offers/${id}`),
}

// ── Tourism ────────────────────────────────────────────────────────────────
export const tourismApi = {
  getAll: (params) => api.get('/tourism', { params }),
  getById: (id) => api.get(`/tourism/${id}`),
  create: (data) => api.post('/tourism', data),
  update: (id, data) => api.put(`/tourism/${id}`, data),
  delete: (id) => api.delete(`/tourism/${id}`),
  getCategories: () => api.get('/tourism/categories'),
  createCategory: (data) => api.post('/tourism/categories', data),
  updateCategory: (id, data) => api.put(`/tourism/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/tourism/categories/${id}`),
}

// ── Contact ────────────────────────────────────────────────────────────────
export const contactApi = {
  getSettings: () => api.get('/contact/settings'),
  updateSettings: (data) => api.put('/contact/settings', data),
}

// ── Leads (contact form submissions) ──────────────────────────────────────
export const leadsApi = {
  getAll: (params) => api.get('/contact/messages', { params }),
  getById: (id) => api.get(`/contact/messages/${id}`),
  updateStatus: (id, data) => api.patch(`/contact/messages/${id}/status`, data),
  delete: (id) => api.delete(`/contact/messages/${id}`),
}

// ── Updates ────────────────────────────────────────────────────────────────
export const updatesApi = {
  getAll: (params) => api.get('/updates', { params }),
  getById: (id) => api.get(`/updates/${id}`),
  create: (data) => api.post('/updates', data),
  update: (id, data) => api.put(`/updates/${id}`, data),
  delete: (id) => api.delete(`/updates/${id}`),
  getCategories: () => api.get('/updates/categories'),
  createCategory: (data) => api.post('/updates/categories', data),
  updateCategory: (id, data) => api.put(`/updates/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/updates/categories/${id}`),
}

// ── Ads ────────────────────────────────────────────────────────────────────
export const adsApi = {
  getAll: (params) => api.get('/ads', { params }),
  getById: (id) => api.get(`/ads/${id}`),
  create: (data) => api.post('/ads', data),
  update: (id, data) => api.put(`/ads/${id}`, data),
  delete: (id) => api.delete(`/ads/${id}`),
}

// ── Sponsorships ───────────────────────────────────────────────────────────
export const sponsorshipsApi = {
  getAll: (params) => api.get('/sponsorships', { params }),
  getById: (id) => api.get(`/sponsorships/${id}`),
  create: (data) => api.post('/sponsorships', data),
  update: (id, data) => api.put(`/sponsorships/${id}`, data),
  delete: (id) => api.delete(`/sponsorships/${id}`),
}

// ── Instagram ──────────────────────────────────────────────────────────────
export const instagramApi = {
  getStatus: () => api.get('/instagram/status'),
  getPosts: () => api.get('/instagram/posts'),
  sync: () => api.post('/instagram/sync'),
  hidePost: (id) => api.delete(`/instagram/${id}`),
  refreshToken: () => api.post('/instagram/refresh-token'),
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats:        () => api.get('/dashboard/stats'),
  getActivity:     (params) => api.get('/dashboard/activity', { params }),
  getRecentLeads:  () => api.get('/dashboard/recent-leads'),
  getRecentUpdates:() => api.get('/dashboard/recent-updates'),
  getFeatured:     () => api.get('/dashboard/featured'),
}

// ── Search ─────────────────────────────────────────────────────────────────
export const searchApi = {
  search: (params) => api.get('/search', { params }),
}

// ── Upload ─────────────────────────────────────────────────────────────────
export const uploadApi = {
  upload: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (url) => api.delete('/upload', { data: { url } }),
}

// ── Settings ───────────────────────────────────────────────────────────────
export const settingsApi = {
  getAdmins: () => api.get('/settings/admins'),
  createAdmin: (data) => api.post('/settings/admins', data),
  updateAdmin: (id, data) => api.put(`/settings/admins/${id}`, data),
  deleteAdmin: (id) => api.delete(`/settings/admins/${id}`),
  getSiteConfig: () => api.get('/settings/site'),
  updateSiteConfig: (data) => api.put('/settings/site', data),
  getAuditLogs: (params) => api.get('/settings/audit-logs', { params }),
}
