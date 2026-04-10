/**
 * Permission guard middleware factory.
 *
 * Usage:  router.post('/', authenticate, permit('news', 'create'), controller)
 *
 * Super admins bypass all checks.
 */
export function permit(module, operation) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }

    if (req.user.role === 'super_admin') return next()

    const perms = req.user.permissions?.[module]
    if (!perms || !perms[operation]) {
      return res.status(403).json({
        success: false,
        message: `Permission denied — ${operation} on ${module} not allowed`,
      })
    }

    next()
  }
}
