/**
 * Common field validators used across all modules.
 * All functions return true if valid, false if invalid.
 */

/** Standard email format */
export const isValidEmail = (email) =>
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())

/** Indian phone: optional +91, then 10 digits; also accepts international formats 7-15 digits */
export const isValidPhone = (phone) =>
  typeof phone === 'string' && /^[\+]?[\d\s\-\(\)]{7,20}$/.test(phone.trim())

/** Indian 6-digit pincode: starts with 1-9, followed by 5 digits */
export const isValidPincode = (pin) =>
  typeof pin === 'string' && /^[1-9][0-9]{5}$/.test(pin.trim())

/** URL must start with http:// or https:// */
export const isValidUrl = (url) => {
  if (typeof url !== 'string' || !url.trim()) return false
  try { const u = new URL(url.trim()); return u.protocol === 'http:' || u.protocol === 'https:' }
  catch { return false }
}

/** Google Analytics Measurement ID: G-XXXXXXXXXX */
export const isValidGaId = (id) =>
  typeof id === 'string' && /^G-[A-Z0-9]{4,15}$/.test(id.trim())

/** Non-empty string after trimming */
export const isNonEmpty = (val) =>
  typeof val === 'string' && val.trim().length > 0

/** Throw a 400 error with message if condition is false */
export function assert(condition, message) {
  if (!condition) {
    const err = new Error(message)
    err.status = 400
    throw err
  }
}
