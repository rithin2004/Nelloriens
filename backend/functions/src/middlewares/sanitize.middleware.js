/**
 * Input sanitization middleware — strips XSS vectors and MongoDB/NoSQL injection operators.
 * Applied globally in app.js before routes.
 */

const MONGO_OP_RE = /\$[a-zA-Z]/g
const HTML_TAG_RE = /<[^>]*>/g

function stripString(val) {
  if (typeof val !== 'string') return val
  return val.replace(MONGO_OP_RE, '').replace(HTML_TAG_RE, '')
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
