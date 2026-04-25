export const ENDPOINTS = {
  // News
  NEWS: {
    LIST:       "/news/list",
    DETAIL:     (id) => `/news/get/${id}`,
    CATEGORIES: "/news/categories/list",
    BREAKING:   "/news/breaking-points/list",
  },

  // Events
  EVENTS: {
    LIST:       "/events/list",
    DETAIL:     (id) => `/events/get/${id}`,
    INFLUENCER: "/events/influencer/list",
    CATEGORIES: "/events/categories/list",
  },

  // Famous Foods
  FOODS: {
    LIST:        "/foods/varieties/list",
    DETAIL:      (id) => `/foods/varieties/get/${id}`,
    HEALTH_TIPS: "/foods/health-tips/list",
  },

  // Famous Stays
  STAYS: {
    LIST:       "/stays/list",
    DETAIL:     (id) => `/stays/get/${id}`,
    CATEGORIES: "/stays/categories/list",
  },

  // Tourism
  TOURISM: {
    LIST:           "/tourism/list",
    DETAIL:         (id) => `/tourism/get/${id}`,
    DISPLAY_PHOTOS: "/tourism/display-photos/list",
    CATEGORIES:     "/tourism/categories/list",
  },

  // History
  HISTORY: {
    LIST:   "/history/list",
    DETAIL: (id) => `/history/get/${id}`,
  },

  // Jobs
  JOBS: {
    LIST:       "/jobs/list",
    DETAIL:     (id) => `/jobs/get/${id}`,
    CATEGORIES: "/jobs/categories/list",
    LOCATIONS:  "/jobs/locations/list",
  },

  // Transport
  TRANSPORT: {
    LIST:   "/transport/list",
    DETAIL: (id) => `/transport/get/${id}`,
  },

  // Movies & Theatres
  MOVIES: {
    LIST:     "/movies/list",
    DETAIL:   (id) => `/movies/get/${id}`,
    UPCOMING: "/movies/upcoming/list",
  },
  THEATRES: {
    LIST: "/theatres/list",
  },

  // Sports
  SPORTS: {
    LIST:        "/sports/list",
    LIVE_SCORES: "/sports/live-scores/list",
    CATEGORIES:  "/sports/categories/list",
  },

  // Results
  RESULTS: {
    LIST:       "/results/list",
    DETAIL:     (id) => `/results/get/${id}`,
    CATEGORIES: "/results/categories/list",
  },

  // Offers
  OFFERS: {
    LIST:       "/offers/list",
    DETAIL:     (id) => `/offers/get/${id}`,
    CATEGORIES: "/offers/categories/list",
  },

  // Updates / Notifications
  UPDATES: {
    LIST:       "/updates/list",
    DETAIL:     (id) => `/updates/get/${id}`,
    CATEGORIES: "/updates/categories/list",
  },

  // Real Estate
  REAL_ESTATE: {
    LIST:      "/realestate/list",
    DETAIL:    (id) => `/realestate/get/${id}`,
    TYPES:     "/realestate/types/list",
    LOCATIONS: "/realestate/locations/list",
  },

  // Right panel
  ADS: {
    LIST: "/ads/list",
  },
  SPONSORSHIPS: {
    LIST: "/sponsorships/list",
  },
  INSTAGRAM: {
    LIST: "/instagram/posts/list",
  },

  // Company / Footer
  COMPANY: {
    GET: "/company/get",
  },

  // Leads (contact form)
  LEADS: {
    SUBMIT: "/leads/submit",
  },

  // Global search
  SEARCH: {
    GLOBAL: "/search",
  },

  // Analytics (fire-and-forget)
  ANALYTICS: {
    CARD_VIEW: (module, id) => `/${module}/${id}/card-views`,
    PAGE_VIEW:  (module, id) => `/${module}/${id}/views`,
  },

  // SSE
  SSE: {
    CONNECT: "/realtime/sse",
  },
};
