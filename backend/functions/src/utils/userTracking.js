/**
 * User Tracking Helpers — RULE 5, RULE 8, RULE 22
 *
 * Provides tracking fields to attach on every content create/update operation:
 *  - Create: createdBy
 *  - Update:  lastModifiedBy, lastModifiedAt
 *
 * Usage in controllers:
 *   import { createTracking, updateTracking } from '../../utils/userTracking.js'
 *
 *   // On create:
 *   const data = await svc.create({ ...req.body, ...createTracking(req.user) })
 *
 *   // On update:
 *   const data = await svc.update(id, { ...req.body, ...updateTracking(req.user) })
 */

/** Extracts a compact user reference for tracking fields */
function byUser(user) {
  if (!user) return { id: 'unknown', name: 'unknown' }
  return { id: user.uid || user.id || 'unknown', name: user.name || user.email || 'unknown' }
}

/**
 * Returns tracking fields for a create operation.
 *
 * @param {object} user  req.user from auth middleware
 * @returns {{ createdBy: object }}
 */
export function createTracking(user) {
  const by = byUser(user)
  return { createdBy: by }
}

/**
 * Returns tracking fields for an update operation.
 *
 * @param {object} user  req.user from auth middleware
 * @returns {{ lastModifiedBy: object, lastModifiedAt: string }}
 */
export function updateTracking(user) {
  return {
    lastModifiedBy: byUser(user),
    lastModifiedAt: new Date().toISOString(),
  }
}
