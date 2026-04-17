/**
 * RULE 18 — Force logout after 1 hour of inactivity.
 *
 * Tracks user activity events (mouse, keyboard, touch, scroll).
 * Resets the idle timer on every activity.
 * Shows a warning modal 5 minutes before the timeout fires.
 * On timeout → calls logout() from AuthContext.
 */
import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from './useAuth'

const TIMEOUT_MS  = 60 * 60 * 1000       // 1 hour
const WARNING_MS  = 5  * 60 * 1000       // warn 5 min before
const EVENTS      = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']

export function useInactivityLogout({ onWarn, onDismissWarn }) {
  const { logout } = useAuth()
  const logoutTimer  = useRef(null)
  const warnTimer    = useRef(null)
  const warnFired    = useRef(false)

  const clearTimers = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current)
    if (warnTimer.current)   clearTimeout(warnTimer.current)
  }, [])

  const resetTimers = useCallback(() => {
    clearTimers()
    warnFired.current = false

    // Warning fires at (TIMEOUT_MS - WARNING_MS)
    warnTimer.current = setTimeout(() => {
      warnFired.current = true
      onWarn?.()
    }, TIMEOUT_MS - WARNING_MS)

    // Logout fires at TIMEOUT_MS
    logoutTimer.current = setTimeout(() => {
      logout()
    }, TIMEOUT_MS)
  }, [clearTimers, logout, onWarn])

  // Allow the warn modal's "Stay Logged In" button to reset the timer
  const extendSession = useCallback(() => {
    onDismissWarn?.()
    resetTimers()
  }, [resetTimers, onDismissWarn])

  useEffect(() => {
    resetTimers()

    const handleActivity = () => {
      // If the warning is already visible, don't auto-dismiss on activity —
      // let the user explicitly click "Stay Logged In"
      if (warnFired.current) return
      resetTimers()
    }

    EVENTS.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }))

    return () => {
      clearTimers()
      EVENTS.forEach((e) => window.removeEventListener(e, handleActivity))
    }
  }, [resetTimers, clearTimers])

  return { extendSession }
}
