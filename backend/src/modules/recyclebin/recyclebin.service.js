/**
 * Recycle Bin Service  (RULE 9)
 *
 * All soft-deleted content lives in the single 'recyclebin' Firestore collection.
 * Each document is the full original, plus:
 *   originalCollection, originalPublishedAt, originalPublishedBy,
 *   deletedAt, deletedBy, reason, _module, _titleField
 *
 * Only superadmin can permanently delete (purge) from the Recycle Bin.
 */

import { db }              from '../../config/firebase.js'
import { badReq, notFound } from '../../utils/serviceBase.js'

const RECYCLE_COL = 'recyclebin'
const PURGE_DAYS  = 15
const BATCH_SIZE  = 400   // 1 op per doc for deletes

/** Compute expiry ISO string from deletedAt */
function expiresAt(deletedAt) {
  return new Date(new Date(deletedAt).getTime() + PURGE_DAYS * 24 * 60 * 60 * 1000).toISOString()
}

/** Build the summary shape returned by listBin */
function toSummary(id, data) {
  const titleField = data._titleField || 'title'
  return {
    _id:          id,
    module:       data._module       || data.originalCollection || '—',
    title:        data[titleField]   || data.title || '(untitled)',
    thumbnail:    data.thumbnail     || data.poster || null,
    deletedAt:    data.deletedAt,
    deletedBy:    data.deletedBy     || null,
    reason:       data.reason        || 'manual',
    expiresAt:    expiresAt(data.deletedAt),
    createdAt:    data.createdAt     || null,
    originalCollection: data.originalCollection,
  }
}

/**
 * List all items in the Recycle Bin, sorted newest-deleted first.
 * Optionally filtered by module.
 */
export async function listBin({ page = 1, limit = 20, module: moduleFilter = '' } = {}) {
  const lim = Math.min(parseInt(limit) || 20, 100)
  const pg  = Math.max(parseInt(page)  || 1,  1)

  const snap = await db.collection(RECYCLE_COL).get()

  let items = snap.docs
    .map(d => toSummary(d.id, d.data()))

  if (moduleFilter) {
    items = items.filter(item => item.module === moduleFilter)
  }

  // Sort newest-deleted first
  items.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt))

  return {
    items:      items.slice((pg - 1) * lim, pg * lim),
    total:      items.length,
    page:       pg,
    totalPages: Math.max(1, Math.ceil(items.length / lim)),
  }
}

/**
 * Restore a single item: writes full original doc back to its collection,
 * then hard-deletes from recyclebin.
 * RULE 9: publishedAt = restoredAt (now), originalPublishedAt preserved separately.
 */
export async function restoreItem(id) {
  const snap = await db.collection(RECYCLE_COL).doc(id).get()
  if (!snap.exists) notFound('Item not found in Recycle Bin')

  const {
    originalCollection, originalPublishedAt, originalPublishedBy,
    deletedAt, deletedBy, reason,
    _module, _titleField,
    ...originalFields
  } = snap.data()

  if (!originalCollection) badReq('Item is missing originalCollection — cannot restore')

  const now        = new Date().toISOString()
  const titleField = _titleField || 'title'
  const title      = originalFields[titleField] || originalFields.title || '(untitled)'

  await db.collection(originalCollection).doc(id).set({
    ...originalFields,
    publishedAt:         now,               // RULE 9: restored item published from now
    restoredAt:          now,
    originalPublishedAt,                    // RULE 9: preserved separately
    originalPublishedBy: originalPublishedBy || null,
    updatedAt:           now,
  })

  await db.collection(RECYCLE_COL).doc(id).delete()

  return { _id: id, module: _module, originalCollection, title }
}

/**
 * Permanently delete a single item from the Recycle Bin.
 * Only superadmin can call this (enforced via route permission).
 */
export async function purgeItem(id) {
  const snap = await db.collection(RECYCLE_COL).doc(id).get()
  if (!snap.exists) notFound('Item not found in Recycle Bin')

  const data       = snap.data()
  const titleField = data._titleField || 'title'
  const title      = data[titleField] || data.title || '(untitled)'
  const module     = data._module     || data.originalCollection

  await db.collection(RECYCLE_COL).doc(id).delete()
  return { _id: id, module, title }
}

/**
 * Permanently delete all items in the Recycle Bin, optionally filtered by module.
 * Only superadmin can call this.
 */
export async function purgeAll(module = '') {
  const snap = await db.collection(RECYCLE_COL).get()

  let toDelete = snap.docs
  if (module) {
    toDelete = toDelete.filter(d => (d.data()._module || d.data().originalCollection) === module)
  }

  if (!toDelete.length) return 0

  for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
    const chunk = toDelete.slice(i, i + BATCH_SIZE)
    const batch = db.batch()
    chunk.forEach(d => batch.delete(d.ref))
    await batch.commit()
  }

  return toDelete.length
}

/**
 * Count of items in the Recycle Bin per module.
 */
export async function binStats() {
  const snap   = await db.collection(RECYCLE_COL).get()
  const byModule = {}
  let   total  = 0

  snap.docs.forEach(d => {
    const mod = d.data()._module || d.data().originalCollection || 'unknown'
    byModule[mod] = (byModule[mod] || 0) + 1
    total++
  })

  return { total, byModule }
}
