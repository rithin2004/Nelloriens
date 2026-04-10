import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(date, pattern = 'dd MMM yyyy') {
  if (!date) return '—'
  return format(new Date(date), pattern)
}

export function formatDateTime(date) {
  if (!date) return '—'
  return format(new Date(date), 'dd MMM yyyy, hh:mm a')
}

export function timeAgo(date) {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function truncate(str, length = 60) {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '...' : str
}

export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}
