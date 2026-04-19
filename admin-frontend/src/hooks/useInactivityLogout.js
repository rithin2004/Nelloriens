/**
 * RULE 18 — Force logout after 1 hour of inactivity.
 *
 * Tracks user activity events (mouse, keyboard, touch, scroll).
 * Resets the idle timer on every activity.
 * Persists lastActivityAt to localStorage so a browser reopen after >1hr
 * triggers immediate logout — not a fresh 1-hour timer.
 * Shows a warning modal 5 minutes before the timeout fires.
 * On timeout → calls logout() from AuthContext.
 */
import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from './useAuth'

const TIMEOUT_MS       = 60 * 60 * 1000       // 1 hour
const WARNING_MS       = 5  * 60 * 1000       // warn 5 min before
const EVENTS           = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
const STORAGE_KEY      = '_lastActivity'

const stampActivity = () => localStorage.setItem(STORAGE_KEY, Date.now().toString())
const readLastActivity = () => parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)

export function useInactivityLogout({ onWarn, onDismissWarn }) {
  const { logout } = useAuth()
  const logoutTimer  = useRef(null)
  const warnTimer    = useRef(null)
  const warnFired    = useRef(false)

  const clearTimers = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current)
    if (warnTimer.current)   clearTimeout(warnTimer.current)
  }, [])

  const resetTimers = useCallback((remainingMs = TIMEOUT_MS) => {
    clearTimers()
    warnFired.current = false

    const warnDelay = remainingMs - WARNING_MS
    if (warnDelay > 0) {
      warnTimer.current = setTimeout(() => {
        warnFired.current = true
        onWarn?.()
      }, warnDelay)
    } else {
      // Less than 5 min remaining — show warning immediately
      warnFired.current = true
      onWarn?.()
    }

    logoutTimer.current = setTimeout(() => {
      localStorage.removeItem(STORAGE_KEY)
      logout()
    }, remainingMs)
  }, [clearTimers, logout, onWarn])

  const extendSession = useCallback(() => {
    onDismissWarn?.()
    stampActivity()
    resetTimers()
  }, [resetTimers, onDismissWarn])

  useEffect(() => {
    // On mount: check if user was away for more than 1 hour (tab closed/reopened)
    const last = readLastActivity()
    if (last > 0) {
      const elapsed = Date.now() - last
      if (elapsed >= TIMEOUT_MS) {
        localStorage.removeItem(STORAGE_KEY)
        logout()
        return
      }
      // Resume the remaining countdown rather than restarting from 1hr
      resetTimers(TIMEOUT_MS - elapsed)
    } else {
      stampActivity()
      resetTimers()
    }

    const handleActivity = () => {
      if (warnFired.current) return
      stampActivity()
      resetTimers()
    }

    EVENTS.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }))

    return () => {
      clearTimers()
      EVENTS.forEach((e) => window.removeEventListener(e, handleActivity))
    }
  }, [resetTimers, clearTimers, logout])

  return { extendSession }
}
