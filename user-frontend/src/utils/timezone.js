const TZ = 'Asia/Kolkata'

function toDate(val) {
  if (!val) return null
  if (val instanceof Date) return val
  if (typeof val === 'number') return new Date(val)
  if (val._seconds !== undefined) return new Date(val._seconds * 1000)
  return new Date(val)
}

function istFmt(d, opts) {
  return new Intl.DateTimeFormat('en-IN', { timeZone: TZ, ...opts }).format(d)
}

/** "27 Jun 2025" */
export function formatDate(val) {
  const d = toDate(val)
  if (!d || isNaN(d.getTime())) return '—'
  return istFmt(d, { day: '2-digit', month: 'short', year: 'numeric' })
}

/** "27 Jun 2025, 02:30 pm" */
export function formatDateTime(val) {
  const d = toDate(val)
  if (!d || isNaN(d.getTime())) return '—'
  return istFmt(d, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
}

/** "02:30 pm" */
export function formatTime(val) {
  const d = toDate(val)
  if (!d || isNaN(d.getTime())) return '—'
  return istFmt(d, { hour: '2-digit', minute: '2-digit', hour12: true })
}

/** "Mon, 27 Jun" */
export function formatShortDate(val) {
  const d = toDate(val)
  if (!d || isNaN(d.getTime())) return '—'
  return istFmt(d, { weekday: 'short', day: 'numeric', month: 'short' })
}

/** Returns a Date object representing "now" in IST for comparisons */
export function nowIST() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TZ }))
}
