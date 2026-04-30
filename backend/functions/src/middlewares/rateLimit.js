import rateLimit from 'express-rate-limit'

// Extracts real client IP even behind Firebase/GCP load balancer.
// X-Forwarded-For may contain: client, proxy1, proxy2 — take leftmost (actual client).
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.ip || req.socket?.remoteAddress || 'unknown'
}

export const globalLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  message: { success: false, message: 'Too many requests, try again later.' },
})

export const strictLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: getClientIp,
  message: { success: false, message: 'Rate limit exceeded.' },
})

export const ultraStrictLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: getClientIp,
  message: { success: false, message: 'Too many attempts. Try again in 1 hour.' },
})
