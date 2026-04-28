import { format, formatDistanceToNow } from 'date-fns'

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

export function formatDate(date, pattern = 'dd MMM yyyy') {
  if (!date) return '—'
  const d = toDate(date)
  if (!d || isNaN(d.getTime())) return '—'
  return format(d, pattern)
}

export function formatDateTime(date) {
  if (!date) return '—'
  const d = toDate(date)
  if (!d || isNaN(d.getTime())) return '—'
  return format(d, 'dd MMM yyyy, hh:mm a')
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

