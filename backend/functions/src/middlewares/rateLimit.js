import rateLimit from 'express-rate-limit'

export const globalLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || 'global',
  message: { success: false, message: 'Too many requests, try again later.' },
})

export const strictLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Rate limit exceeded.' },
})

export const ultraStrictLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts. Try again in 1 hour.' },
})
