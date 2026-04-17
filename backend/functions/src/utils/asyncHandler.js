/**
 * Wraps an async route handler so uncaught errors are forwarded to
 * Express's global error middleware via next(err).
 *
 * Usage in routes:
 *   router.get('/list', auth, permit('news','read'), asyncHandler(c.list))
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
