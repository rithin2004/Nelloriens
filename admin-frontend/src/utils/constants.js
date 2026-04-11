export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const MODULES = {
  NEWS: 'news',
  JOBS: 'jobs',
  RESULTS: 'results',
  SPORTS: 'sports',
  FOODS: 'foods',
  HISTORY: 'history',
  STAYS: 'stays',
  EVENTS: 'events',
  MOVIES: 'movies',
  TRANSPORT: 'transport',
  OFFERS: 'offers',
  TOURISM: 'tourism',
  CONTACT: 'contact',
  UPDATES: 'updates',
  ADS: 'ads',
  SPONSORSHIPS: 'sponsorships',
  INSTAGRAM: 'instagram',
}

export const STATUS_OPTIONS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
}

export const NELLORE_CENTER = { lat: 14.4426, lng: 79.9865 }
