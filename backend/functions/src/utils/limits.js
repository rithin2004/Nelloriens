import { db } from '../config/firebase.js'

const LIMITS_DOC = 'config/limits'

export const LIMIT_DEFAULTS = {
  maxImportantNewsPerCategory: 3,
  maxPopularEventsPerCategory: 3,
  maxInfluencerEvents:         5,
  maxTopStayPerCategory:       3,
  maxPopularTourism:           10,
  maxPopularFoodVarieties:     6,
  maxSweetsGlobally:           8,
  maxUpcomingMovies:           10,
  maxUpcomingSports:           12,
  maxBreakingNews:             25,
  maxInstagramPosts:           6,
}

const KNOWN_KEYS = new Set(Object.keys(LIMIT_DEFAULTS))

let _cache      = null
let _expiresAt  = 0
const CACHE_TTL = 60_000 // 60 seconds

export async function getLimits() {
  if (_cache && Date.now() < _expiresAt) return _cache
  const snap  = await db.doc(LIMITS_DOC).get()
  const stored = snap.exists ? snap.data() : {}
  _cache      = { ...LIMIT_DEFAULTS, ...stored }
  _expiresAt  = Date.now() + CACHE_TTL
  return _cache
}

export function invalidateLimitsCache() {
  _cache     = null
  _expiresAt = 0
}

/** Validate and sanitise limits from request body — returns clean object or throws */
export function parseLimitsPayload(body = {}) {
  const update = {}
  for (const [key, val] of Object.entries(body)) {
    if (!KNOWN_KEYS.has(key)) continue
    const n = parseInt(val)
    if (!Number.isFinite(n) || n < 1 || n > 9999) {
      const err = new Error(`"${key}" must be an integer between 1 and 9999`)
      err.status = 400
      throw err
    }
    update[key] = n
  }
  if (Object.keys(update).length === 0) {
    const err = new Error('No valid limit keys provided')
    err.status = 400
    throw err
  }
  return update
}
