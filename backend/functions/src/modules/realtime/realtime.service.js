/**
 * Realtime Service — RULE 7
 *
 * Runs Firestore onSnapshot listeners (Admin SDK) for all watched collections.
 * When a collection changes, broadcasts { module, action } SSE event
 * to all connected admin clients.
 *
 * Frontends receive the event, look up the module's Zustand store,
 * and call store.fetch() to re-fetch from the backend REST API.
 */
import { db } from '../../config/firebase.js'

const WATCHED_COLLECTIONS = [
  'news', 'events', 'influencer_events', 'breaking_points',
  'updates', 'history', 'transport', 'foods', 'stays',
  'tourism', 'tourism_display_photos', 'offers', 'movies', 'movie_trailers', 'theatres',
  'sports', 'company', 'leads',
  'results', 'jobs', 'ads', 'sponsorships', 'instagram', 'recyclebin',
  'roles', 'users', 'activitylog', 'realestate',
]

// Active SSE response streams (one per connected browser tab)
const clients = new Set()

// Per-collection debounce timers — prevents flooding on bulk operations
const debounceTimers = new Map()
const DEBOUNCE_MS = 200

export function addClient(res)    { clients.add(res) }
export function removeClient(res) { clients.delete(res) }

/**
 * Broadcast a module-changed event to all SSE clients.
 * Debounced per collection: if 50 docs are deleted at once, only 1 event fires.
 *
 * @param {string} module     Firestore collection / module name
 * @param {string} action     'changed' (from onSnapshot) or specific action from controllers
 * @param {object} data       Optional extra payload (kept minimal — no sensitive content)
 */
export function broadcast(module, action = 'changed', data = {}) {
  if (debounceTimers.has(module)) clearTimeout(debounceTimers.get(module))
  debounceTimers.set(module, setTimeout(() => {
    debounceTimers.delete(module)
    const payload = `data: ${JSON.stringify({ module, action, data })}\n\n`
    clients.forEach(client => {
      try { client.write(payload) }
      catch { clients.delete(client) }   // remove dead connections
    })
  }, DEBOUNCE_MS))
}

/**
 * Start onSnapshot listeners for all watched collections.
 * Called ONCE on server startup (server.js).
 *
 * The very first snapshot fires immediately with all existing data — we skip it.
 * Only subsequent changes (create / update / delete) trigger a broadcast.
 */
export function startRealtimeListeners() {
  WATCHED_COLLECTIONS.forEach(col => {
    let initialLoad = true
    db.collection(col).onSnapshot(
      () => {
        if (initialLoad) { initialLoad = false; return }
        broadcast(col, 'changed')
      },
      (err) => console.error(`[Realtime] onSnapshot error on '${col}':`, err.message)
    )
  })
  console.log(`✓ Realtime SSE listeners active for ${WATCHED_COLLECTIONS.length} collections`)
}
