/**
 * Permission guard middleware.
 * Permissions are level-based per module: none | read | read_write | full
 *
 *   none       → no access at all
 *   read       → list / get only
 *   read_write → list / get / create / update
 *   full       → all including delete
 *
 * Usage: router.post('/', authenticate, permit('news', 'create'), handler)
 */

const LEVEL_RANK = { none: 0, read: 1, read_write: 2, full: 3 }

// Minimum rank required for each operation keyword
const OP_REQUIRED = {
  read:   1,
  create: 2,
  update: 2,
  delete: 3,
}

function levelName(rank) {
  return Object.keys(LEVEL_RANK).find(k => LEVEL_RANK[k] === rank) || 'none'
}

export function permit(module, operation) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }

    // Superadmin bypasses everything
    if (req.user.roleName === 'superadmin') return next()

    const level    = req.user.permissions?.[module] || 'none'
    const rank     = LEVEL_RANK[level] ?? 0
    const required = OP_REQUIRED[operation]         ?? 1

    if (rank < required) {
      return res.status(403).json({
        success:  false,
        message:  `Permission denied — "${operation}" on "${module}" requires level "${levelName(required)}", you have "${level}"`,
      })
    }

    next()
  }
}
