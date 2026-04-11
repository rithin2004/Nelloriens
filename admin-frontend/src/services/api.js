import api from '../hooks/useApi'

// ── News ───────────────────────────────────────────────────────────────────
export const newsApi = {
  getAll:   (params) => api.get('/news/list', { params }),
  getById:  (id)     => api.get(`/news/get/${id}`),
  create:   (data)   => api.post('/news/create', data),
  update:   (id, data) => api.put(`/news/update/${id}`, data),
  delete:   (id)     => api.delete(`/news/delete/${id}`),
  bulkDelete:  (ids) => api.post('/news/delete-batch', { ids }),
  bulkPublish: (ids) => api.post('/news/publish-batch', { ids }),
  // Categories
  getCategories:    ()           => api.get('/news/categories/list'),
  createCategory:   (data)       => api.post('/news/categories/create', data),
  updateCategory:   (id, data)   => api.put(`/news/categories/update/${id}`, data),
  deleteCategory:   (id)         => api.delete(`/news/categories/delete/${id}`),
  // Breaking news points
  getBreakingPoints:    ()           => api.get('/news/breaking-points/list'),
  createBreakingPoint:  (data)       => api.post('/news/breaking-points/create', data),
  updateBreakingPoint:  (id, data)   => api.put(`/news/breaking-points/update/${id}`, data),
  deleteBreakingPoint:  (id)         => api.delete(`/news/breaking-points/delete/${id}`),
  reorderBreakingPoints:(ids)        => api.patch('/news/breaking-points/reorder', { ids }),
}

// ── Jobs ───────────────────────────────────────────────────────────────────
export const jobsApi = {
  getAll:   (params) => api.get('/jobs/list', { params }),
  getById:  (id)     => api.get(`/jobs/get/${id}`),
  create:   (data)   => api.post('/jobs/create', data),
  update:   (id, data) => api.put(`/jobs/update/${id}`, data),
  delete:   (id)     => api.delete(`/jobs/delete/${id}`),
  // Categories
  getCategories:  ()           => api.get('/jobs/categories/list'),
  createCategory: (data)       => api.post('/jobs/categories/create', data),
  updateCategory: (id, data)   => api.put(`/jobs/categories/update/${id}`, data),
  deleteCategory: (id)         => api.delete(`/jobs/categories/delete/${id}`),
  // Locations
  getLocations:   ()           => api.get('/jobs/locations/list'),
  createLocation: (data)       => api.post('/jobs/locations/create', data),
  updateLocation: (id, data)   => api.put(`/jobs/locations/update/${id}`, data),
  deleteLocation: (id)         => api.delete(`/jobs/locations/delete/${id}`),
}

// ── Results ────────────────────────────────────────────────────────────────
export const resultsApi = {
  getAll:   (params) => api.get('/results/list', { params }),
  getById:  (id)     => api.get(`/results/get/${id}`),
  create:   (data)   => api.post('/results/create', data),
  update:   (id, data) => api.put(`/results/update/${id}`, data),
  delete:   (id)     => api.delete(`/results/delete/${id}`),
  // Categories
  getCategories:  ()           => api.get('/results/categories/list'),
  createCategory: (data)       => api.post('/results/categories/create', data),
  updateCategory: (id, data)   => api.put(`/results/categories/update/${id}`, data),
  deleteCategory: (id)         => api.delete(`/results/categories/delete/${id}`),
}

// ── Sports ─────────────────────────────────────────────────────────────────
export const sportsApi = {
  getAll:   (params) => api.get('/sports/list', { params }),
  getById:  (id)     => api.get(`/sports/get/${id}`),
  create:   (data)   => api.post('/sports/create', data),
  update:   (id, data) => api.put(`/sports/update/${id}`, data),
  delete:   (id)     => api.delete(`/sports/delete/${id}`),
  // Categories
  getCategories:  ()           => api.get('/sports/categories/list'),
  createCategory: (data)       => api.post('/sports/categories/create', data),
  updateCategory: (id, data)   => api.put(`/sports/categories/update/${id}`, data),
  deleteCategory: (id)         => api.delete(`/sports/categories/delete/${id}`),
}

// ── Foods ──────────────────────────────────────────────────────────────────
export const foodsApi = {
  getAll:   (params) => api.get('/foods/list', { params }),
  getById:  (id)     => api.get(`/foods/get/${id}`),
  create:   (data)   => api.post('/foods/create', data),
  update:   (id, data) => api.put(`/foods/update/${id}`, data),
  delete:   (id)     => api.delete(`/foods/delete/${id}`),
  // Photos (ordered, max 5)
  getPhotos:    ()       => api.get('/foods/photos/list'),
  addPhoto:     (data)   => api.post('/foods/photos/create', data),
  deletePhoto:  (id)     => api.delete(`/foods/photos/delete/${id}`),
  reorderPhotos:(ids)    => api.patch('/foods/photos/reorder', { ids }),
  // Varieties
  getVarieties:   ()           => api.get('/foods/varieties/list'),
  createVariety:  (data)       => api.post('/foods/varieties/create', data),
  updateVariety:  (id, data)   => api.put(`/foods/varieties/update/${id}`, data),
  deleteVariety:  (id)         => api.delete(`/foods/varieties/delete/${id}`),
  // Sweets (max 8)
  getSweets:   ()           => api.get('/foods/sweets/list'),
  createSweet: (data)       => api.post('/foods/sweets/create', data),
  updateSweet: (id, data)   => api.put(`/foods/sweets/update/${id}`, data),
  deleteSweet: (id)         => api.delete(`/foods/sweets/delete/${id}`),
}

// ── History ────────────────────────────────────────────────────────────────
export const historyApi = {
  getAll:   (params) => api.get('/history/list', { params }),
  getById:  (id)     => api.get(`/history/get/${id}`),
  create:   (data)   => api.post('/history/create', data),
  update:   (id, data) => api.put(`/history/update/${id}`, data),
  delete:   (id)     => api.delete(`/history/delete/${id}`),
  reorder:  (ids)    => api.patch('/history/reorder', { ids }),
}

// ── Stays ──────────────────────────────────────────────────────────────────
export const staysApi = {
  getAll:   (params) => api.get('/stays/list', { params }),
  getById:  (id)     => api.get(`/stays/get/${id}`),
  create:   (data)   => api.post('/stays/create', data),
  update:   (id, data) => api.put(`/stays/update/${id}`, data),
  delete:   (id)     => api.delete(`/stays/delete/${id}`),
}

// ── Events ─────────────────────────────────────────────────────────────────
export const eventsApi = {
  getAll:   (params) => api.get('/events/list', { params }),
  getById:  (id)     => api.get(`/events/get/${id}`),
  create:   (data)   => api.post('/events/create', data),
  update:   (id, data) => api.put(`/events/update/${id}`, data),
  delete:   (id)     => api.delete(`/events/delete/${id}`),
  // Categories
  getCategories:  ()           => api.get('/events/categories/list'),
  createCategory: (data)       => api.post('/events/categories/create', data),
  updateCategory: (id, data)   => api.put(`/events/categories/update/${id}`, data),
  deleteCategory: (id)         => api.delete(`/events/categories/delete/${id}`),
}

// ── Movies ─────────────────────────────────────────────────────────────────
export const moviesApi = {
  getAll:   (params) => api.get('/movies/list', { params }),
  getById:  (id)     => api.get(`/movies/get/${id}`),
  create:   (data)   => api.post('/movies/create', data),
  update:   (id, data) => api.put(`/movies/update/${id}`, data),
  delete:   (id)     => api.delete(`/movies/delete/${id}`),
  // Theatres
  getTheatres:   ()           => api.get('/theatres/list'),
  createTheatre: (data)       => api.post('/theatres/create', data),
  updateTheatre: (id, data)   => api.put(`/theatres/update/${id}`, data),
  deleteTheatre: (id)         => api.delete(`/theatres/delete/${id}`),
}

// ── Transport ──────────────────────────────────────────────────────────────
export const transportApi = {
  getAll:   (params) => api.get('/transport/list', { params }),
  getById:  (id)     => api.get(`/transport/get/${id}`),
  create:   (data)   => api.post('/transport/create', data),
  update:   (id, data) => api.put(`/transport/update/${id}`, data),
  delete:   (id)     => api.delete(`/transport/delete/${id}`),
  // Categories
  getCategories:  ()           => api.get('/transport/categories/list'),
  createCategory: (data)       => api.post('/transport/categories/create', data),
  updateCategory: (id, data)   => api.put(`/transport/categories/update/${id}`, data),
  deleteCategory: (id)         => api.delete(`/transport/categories/delete/${id}`),
}

// ── Offers ─────────────────────────────────────────────────────────────────
export const offersApi = {
  getAll:   (params) => api.get('/offers/list', { params }),
  getById:  (id)     => api.get(`/offers/get/${id}`),
  create:   (data)   => api.post('/offers/create', data),
  update:   (id, data) => api.put(`/offers/update/${id}`, data),
  delete:   (id)     => api.delete(`/offers/delete/${id}`),
}

// ── Tourism ────────────────────────────────────────────────────────────────
export const tourismApi = {
  getAll:   (params) => api.get('/tourism/list', { params }),
  getById:  (id)     => api.get(`/tourism/get/${id}`),
  create:   (data)   => api.post('/tourism/create', data),
  update:   (id, data) => api.put(`/tourism/update/${id}`, data),
  delete:   (id)     => api.delete(`/tourism/delete/${id}`),
  // Categories
  getCategories:  ()           => api.get('/tourism/categories/list'),
  createCategory: (data)       => api.post('/tourism/categories/create', data),
  updateCategory: (id, data)   => api.put(`/tourism/categories/update/${id}`, data),
  deleteCategory: (id)         => api.delete(`/tourism/categories/delete/${id}`),
}

// ── Updates ────────────────────────────────────────────────────────────────
export const updatesApi = {
  getAll:   (params) => api.get('/updates/list', { params }),
  getById:  (id)     => api.get(`/updates/get/${id}`),
  create:   (data)   => api.post('/updates/create', data),
  update:   (id, data) => api.put(`/updates/update/${id}`, data),
  delete:   (id)     => api.delete(`/updates/delete/${id}`),
  // Categories
  getCategories:  ()           => api.get('/updates/categories/list'),
  createCategory: (data)       => api.post('/updates/categories/create', data),
  updateCategory: (id, data)   => api.put(`/updates/categories/update/${id}`, data),
  deleteCategory: (id)         => api.delete(`/updates/categories/delete/${id}`),
}

// ── Ads ────────────────────────────────────────────────────────────────────
export const adsApi = {
  getAll:   (params) => api.get('/ads/list', { params }),
  getById:  (id)     => api.get(`/ads/get/${id}`),
  create:   (data)   => api.post('/ads/create', data),
  update:   (id, data) => api.put(`/ads/update/${id}`, data),
  delete:   (id)     => api.delete(`/ads/delete/${id}`),
  // AdSense settings
  getAdsenseSettings: ()     => api.get('/ads/settings/get'),
  connectAdsense:     (data) => api.post('/ads/settings/connect', data),
  updateAdsense:      (data) => api.put('/ads/settings/update', data),
  disconnectAdsense:  ()     => api.delete('/ads/settings/disconnect'),
}

// ── Sponsorships ───────────────────────────────────────────────────────────
export const sponsorshipsApi = {
  getAll:   (params) => api.get('/sponsorships/list', { params }),
  getById:  (id)     => api.get(`/sponsorships/get/${id}`),
  create:   (data)   => api.post('/sponsorships/create', data),
  update:   (id, data) => api.put(`/sponsorships/update/${id}`, data),
  delete:   (id)     => api.delete(`/sponsorships/delete/${id}`),
}

// ── Instagram ──────────────────────────────────────────────────────────────
export const instagramApi = {
  // Settings
  getSettings:    ()     => api.get('/instagram/settings/get'),
  connect:        (data) => api.post('/instagram/settings/connect', data),
  disconnect:     ()     => api.delete('/instagram/settings/disconnect'),
  // Posts
  getStatus:      ()     => api.get('/instagram/status'),
  getPosts:       ()     => api.get('/instagram/posts/list'),
  createPost:     (data) => api.post('/instagram/posts/create', data),
  updatePost:     (id, data) => api.put(`/instagram/posts/update/${id}`, data),
  sync:           ()     => api.post('/instagram/sync'),
  hidePost:       (id)   => api.delete(`/instagram/delete/${id}`),
  refreshToken:   ()     => api.post('/instagram/refresh-token'),
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats:       ()       => api.get('/dashboard/stats'),
  getActivity:    (params) => api.get('/dashboard/activity', { params }),
  getRecentLeads: ()       => api.get('/dashboard/recent-leads'),
  getFeatured:    ()       => api.get('/dashboard/featured'),
}

// ── Search ─────────────────────────────────────────────────────────────────
export const searchApi = {
  search: (params) => api.get('/search', { params }),
}

// ── Upload ─────────────────────────────────────────────────────────────────
export const uploadApi = {
  upload: (moduleName, formData) => api.post(`/upload/${moduleName}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (url) => api.delete('/upload/delete', { data: { url } }),
}

// ── Settings ───────────────────────────────────────────────────────────────
export const settingsApi = {
  getSiteConfig:   ()      => api.get('/settings/site/get'),
  updateSiteConfig:(data)  => api.put('/settings/site/update', data),
  getAuditLogs:    (params)=> api.get('/settings/audit-logs/list', { params }),
}

// ── Users ──────────────────────────────────────────────────────────────────
export const usersApi = {
  me:              ()       => api.get('/users/me'),
  updateMe:        (data)   => api.patch('/users/me', data),
  getAll:          (params) => api.get('/users/list', { params }),
  getById:         (id)     => api.get(`/users/get/${id}`),
  create:          (data)   => api.post('/users/create', data),
  update:          (id, data) => api.put(`/users/update/${id}`, data),
  delete:          (id)     => api.delete(`/users/delete/${id}`),
  getResetLink:    (id)     => api.get(`/users/reset-link/${id}`),
}

// ── Roles ──────────────────────────────────────────────────────────────────
export const rolesApi = {
  getAll:   (params) => api.get('/roles/list', { params }),
  getById:  (id)     => api.get(`/roles/get/${id}`),
  create:   (data)   => api.post('/roles/create', data),
  update:   (id, data) => api.put(`/roles/update/${id}`, data),
  delete:   (id)     => api.delete(`/roles/delete/${id}`),
}

// ── Company ────────────────────────────────────────────────────────────────
export const companyApi = {
  get:    ()     => api.get('/company/get'),
  create: (data) => api.post('/company/create', data),
  update: (data) => api.put('/company/update', data),
}

// ── Leads ──────────────────────────────────────────────────────────────────
export const leadsApi = {
  // Public
  submit:  (data)         => api.post('/leads/submit', data),
  // Admin
  getAll:  (params)       => api.get('/leads/list', { params }),
  getById: (id)           => api.get(`/leads/get/${id}`),
  update:  (id, data)     => api.put(`/leads/update/${id}`, data),
  delete:  (id)           => api.delete(`/leads/delete/${id}`),
}

// ── Setup ──────────────────────────────────────────────────────────────────
export const setupApi = {
  getStatus:       ()     => api.get('/setup/status'),
  createSuperadmin:(data) => api.post('/setup/create-superadmin', data),
}
