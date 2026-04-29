/**
 * Input sanitization middleware — strips XSS vectors and MongoDB/NoSQL injection operators.
 * Applied globally in app.js before routes.
 *
 * Only strips actual dangerous HTML (script/iframe/event-handler tags) — NOT arbitrary
 * angle-bracket text like "<CEO>" or "< 1000" which React renders safely in text nodes.
 */

const MONGO_OP_RE = /\$[a-zA-Z]/g
// Strip full <script>...</script> blocks including their content
const SCRIPT_BLOCK_RE = /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi
// Matches remaining dangerous HTML constructs: <iframe>, on* handlers, javascript: URLs
const DANGEROUS_HTML_RE = /<(?:style|iframe|object|embed|link|meta|svg|math|base|applet|form)\b[^>]*>|<\/(?:style|iframe|object|embed|form)\s*>|javascript\s*:|on[a-z]{2,}\s*=/gi

function stripString(val) {
  if (typeof val !== 'string') return val
  return val.replace(SCRIPT_BLOCK_RE, '').replace(MONGO_OP_RE, '').replace(DANGEROUS_HTML_RE, '')
}

function sanitizeValue(val) {
  if (val === null || val === undefined) return val
  if (typeof val === 'string')  return stripString(val)
  if (Array.isArray(val))       return val.map(sanitizeValue)
  if (typeof val === 'object')  return sanitizeObject(val)
  return val
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    // Drop keys that start with '$' (NoSQL injection via key names)
    if (typeof k === 'string' && k.startsWith('$')) continue
    out[k] = sanitizeValue(v)
  }
  return out
}

export function sanitizeInput(req, _res, next) {
  if (req.body   && typeof req.body   === 'object') req.body   = sanitizeObject(req.body)
  if (req.query  && typeof req.query  === 'object') req.query  = sanitizeObject(req.query)
  if (req.params && typeof req.params === 'object') req.params = sanitizeObject(req.params)
  next()
}
