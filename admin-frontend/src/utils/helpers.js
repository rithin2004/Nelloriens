import { formatDistanceToNow } from 'date-fns'

// Safely convert any date-like value to a JS Date.
// Handles: ISO strings, JS Date, Unix timestamps (ms),
// and Firestore Timestamps serialised as { _seconds, _nanoseconds }.
function toDate(val) {
  if (!val) return null
  if (val instanceof Date) return val
  if (typeof val === 'number') return new Date(val)
  if (val._seconds !== undefined) return new Date(val._seconds * 1000)
  if (val.seconds  !== undefined) return new Date(val.seconds  * 1000)
  return new Date(val)
}

// Admin portal always shows IST (RULE 5)
function istFmt(d, opts) {
  return new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', ...opts }).format(d)
}

export function formatDate(date) {
  if (!date) return '—'
  const d = toDate(date)
  if (!d || isNaN(d.getTime())) return '—'
  return istFmt(d, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(date) {
  if (!date) return '—'
  const d = toDate(date)
  if (!d || isNaN(d.getTime())) return '—'
  return istFmt(d, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
}

export function timeAgo(date) {
  if (!date) return '—'
  const d = toDate(date)
  if (!d || isNaN(d.getTime())) return '—'
  return formatDistanceToNow(d, { addSuffix: true })
}

export function truncate(str, length = 60) {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '...' : str
}

