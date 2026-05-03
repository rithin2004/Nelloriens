/**
 * SSE Service — RULE 7
 *
 * Manages a single persistent SSE connection for the entire app session.
 * On SSE event received → calls onMessage callback with { module, action }.
 *
 * Resilience (RULE 7 — SSE Resilience):
 *  - Auto-reconnects with exponential backoff (1s → 2s → 4s → … → 30s max)
 *  - On reconnect → calls onReconnect() immediately to re-fetch all Zustand stores
 *    (does not wait for next SSE event — catches any changes that happened while disconnected)
 *
 * Usage:
 *   import { connect, disconnect } from './sse'
 *   connect(({ module, action }) => { ... }, () => { refetchAllStores() })
 *   disconnect()
 */

let es            = null
let retryTimer    = null
let onMessage     = null
let onReconnect   = null
let retryDelay    = 1000   // start at 1 second
let hasConnected  = false  // true after first successful connection open

const MAX_RETRY_DELAY = 30000 // 30 seconds cap

function _connect() {
  if (es && es.readyState !== EventSource.CLOSED) return

  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')
  es = new EventSource(`${base}/realtime/sse`)

  es.onopen = () => {
    // Reset backoff on successful connection
    retryDelay = 1000
    // Fire onReconnect only on subsequent connections, not the initial one
    if (hasConnected && onReconnect) onReconnect()
    hasConnected = true
  }

  es.onmessage = (e) => {
    try {
      const payload = JSON.parse(e.data)
      // Ignore control messages (connected, ping)
      if (payload.type === 'connected' || payload.type === 'ping') return
      if (onMessage) onMessage(payload)
    } catch { /* ignore malformed messages */ }
  }

  es.onerror = () => {
    es.close()
    es = null
    clearTimeout(retryTimer)
    // Exponential backoff — doubles each retry, capped at MAX_RETRY_DELAY
    retryTimer = setTimeout(() => {
      retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY)
      _connect()
    }, retryDelay)
  }
}

/**
 * Open the SSE connection and register callbacks.
 * Safe to call multiple times — only one connection is maintained.
 *
 * @param {function} handler    Called with { module, action } on every SSE event
 * @param {function} [refetch]  Called immediately on reconnect — use to re-fetch all Zustand stores
 */
export function connect(handler, refetch) {
  onMessage   = handler
  onReconnect = refetch || null
  _connect()
}

/**
 * Close the SSE connection and clear all callbacks.
 * Called on component unmount (Layout cleanup).
 */
export function disconnect() {
  clearTimeout(retryTimer)
  if (es) { es.close(); es = null }
  onMessage   = null
  onReconnect = null
  hasConnected = false
  retryDelay  = 1000
}
