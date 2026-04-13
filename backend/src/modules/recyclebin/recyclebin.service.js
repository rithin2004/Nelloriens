/**
 * Recycle Bin Service
 *
 * Aggregates soft-deleted items across all content collections.
 * Provides list, restore, and permanent-delete (purge) operations.
 *
 * Only content modules are included — categories, locations, users, roles,
 * and company are never moved to the Recycle Bin.
 */

import { db }               from '../../config/firebase.js'
import { CONTENT_MODULES }  from '../../utils/archival.js'
import { badReq, notFound } from '../../utils/serviceBase.js'

const PURGE_DAYS = 15

/** Milliseconds until a Recycle Bin item expires */
function expiresAt(deletedAt) {
  return new Date(new Date(deletedAt).getTime() + PURGE_DAYS * 24 * 60 * 60 * 1000).toISOString()
}

/**
 * List all soft-deleted items across all (or a filtered) content collection.
 * Returns items sorted newest-deleted first.
 */
export async function listBin({ page = 1, limit = 20, module: moduleFilter = '' } = {}) {
  const lim = Math.min(parseInt(limit) || 20, 100)
  const pg  = Math.max(parseInt(page)  || 1,  1)

  const targets = moduleFilter
    ? CONTENT_MODULES.filter(m => m.module === moduleFilter)
    : CONTENT_MODULES

  let allDeleted = []

  await Promise.all(targets.map(async ({ module, collection, titleField }) => {
    try {
      const snap = await db.collection(collection).get()
      const deleted = snap.docs
        .map(d => ({ _id: d.id, ...d.data() }))
        .filter(item => item.deletedAt)
        .map(item => ({
          _id:          item._id,
          module,
          title:        item[titleField] || item.title || '(untitled)',
          thumbnail:    item.thumbnail   || null,
          deletedAt:    item.deletedAt,
          deletedBy:    item.deletedBy   || null,
          deleteReason: item.deleteReason || 'manual',
          expiresAt:    expiresAt(item.deletedAt),
          createdAt:    item.createdAt   || null,
        }))
      allDeleted.push(...deleted)
    } catch {
      // If a collection doesn't exist yet, skip it
    }
  }))

  // Sort newest-deleted first
  allDeleted.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt))

  return {
    items:      allDeleted.slice((pg - 1) * lim, pg * lim),
    total:      allDeleted.length,
    page:       pg,
    totalPages: Math.max(1, Math.ceil(allDeleted.length / lim)),
  }
}

/**
 * Restore a single item from the Recycle Bin back to live state.
 */
export async function restoreItem(id, module) {
  const moduleInfo = CONTENT_MODULES.find(m => m.module === module)
  if (!moduleInfo) badReq(`Unknown module: ${module}`)

  const snap = await db.collection(moduleInfo.collection).doc(id).get()
  if (!snap.exists) notFound('Item not found in Recycle Bin')

  const data = snap.data()
  if (!data.deletedAt) badReq('Item is not in the Recycle Bin')

  const now = new Date().toISOString()
  await db.collection(moduleInfo.collection).doc(id).update({
    deletedAt:    null,
    deletedBy:    null,
    deleteReason: null,
    updatedAt:    now,
  })

  return { _id: id, module, title: data[moduleInfo.titleField] || data.title || '(untitled)' }
}

/**
 * Permanently delete a single item from the Recycle Bin.
 */
export async function purgeItem(id, module) {
  const moduleInfo = CONTENT_MODULES.find(m => m.module === module)
  if (!moduleInfo) badReq(`Unknown module: ${module}`)

  const snap = await db.collection(moduleInfo.collection).doc(id).get()
  if (!snap.exists) notFound('Item not found in Recycle Bin')

  const data = snap.data()
  if (!data.deletedAt) badReq('Item is not in the Recycle Bin')

  await db.collection(moduleInfo.collection).doc(id).delete()
  return { _id: id, module }
}

/**
 * Permanently delete all items in the Recycle Bin (optionally filtered by module).
 */
export async function purgeAll(module = '') {
  const targets = module
    ? CONTENT_MODULES.filter(m => m.module === module)
    : CONTENT_MODULES

  let totalPurged = 0

  await Promise.all(targets.map(async ({ collection }) => {
    try {
      const snap = await db.collection(collection).get()
      const toDelete = snap.docs.filter(d => d.data().deletedAt)
      if (!toDelete.length) return

      const batch = db.batch()
      toDelete.forEach(d => batch.delete(d.ref))
      await batch.commit()
      totalPurged += toDelete.length
    } catch {
      // skip missing collections
    }
  }))

  return totalPurged
}

/**
 * Count of items currently in Recycle Bin per module.
 */
export async function binStats() {
  const stats = {}
  let total = 0

  await Promise.all(CONTENT_MODULES.map(async ({ module, collection }) => {
    try {
      const snap = await db.collection(collection).get()
      const count = snap.docs.filter(d => d.data().deletedAt).length
      stats[module] = count
      total += count
    } catch {
      stats[module] = 0
    }
  }))

  return { total, byModule: stats }
}
