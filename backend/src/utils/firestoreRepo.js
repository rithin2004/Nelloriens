/**
 * Base Firestore Repository
 * Wraps common Firestore operations so every module repository
 * uses a consistent, tested data-access layer.
 *
 * RULE 9 — Recycle Bin:
 *   softDelete()  → copies full original document to the 'recyclebin' collection,
 *                   then hard-deletes it from the source collection.
 *   restore()     → reads from 'recyclebin', writes back to original collection,
 *                   then hard-deletes from 'recyclebin'.
 *   batchSoftDelete() → same as softDelete, batched.
 */
import admin      from '../config/firebase.js'
import { db }     from '../config/firebase.js'
import { nextId } from './sequentialId.js'

const RECYCLE_COL = 'recyclebin'
const BATCH_SIZE  = 200   // Firestore 500-op limit; each doc = 2 ops (set + delete)

export class FirestoreRepo {
  /**
   * @param {string} collection  Firestore collection name
   * @param {object} opts
   * @param {string} [opts.idPrefix]   If set, IDs are generated as PREFIX00001 via sequential counter
   * @param {string} [opts.module]     Module name for recyclebin metadata (defaults to collection name)
   * @param {string} [opts.titleField] Field used as display title in recyclebin (defaults to 'title')
   */
  constructor(collection, { idPrefix, module, titleField } = {}) {
    this.col        = collection
    this.ref        = db.collection(collection)
    this.idPrefix   = idPrefix   || null
    this.module     = module     || collection
    this.titleField = titleField || 'title'
  }

  // ── Read ─────────────────────────────────────────────────────────────────

  async findById(id) {
    const snap = await this.ref.doc(id).get()
    if (!snap.exists) return null
    return { _id: snap.id, ...snap.data() }
  }

  async findAll({ orderBy = 'createdAt', order = 'desc', filters = [] } = {}) {
    let q = this.ref
    for (const [field, op, value] of filters) {
      if (value !== undefined && value !== null && value !== '') {
        q = q.where(field, op, value)
      }
    }
    const snap = await q.orderBy(orderBy, order).get()
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }))
  }

  async paginate({ page = 1, limit = 20, orderBy = 'createdAt', order = 'desc', filters = [] } = {}) {
    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100)
    const safePage  = Math.max(parseInt(page) || 1, 1)
    const offset    = (safePage - 1) * safeLimit

    let q = this.ref
    for (const [field, op, value] of filters) {
      if (value !== undefined && value !== null && value !== '') {
        q = q.where(field, op, value)
      }
    }

    const [countSnap, snap] = await Promise.all([
      q.count().get(),
      q.orderBy(orderBy, order).offset(offset).limit(safeLimit).get(),
    ])

    const total = countSnap.data().count
    const items = snap.docs.map(d => ({ _id: d.id, ...d.data() }))

    return { items, total, page: safePage, totalPages: Math.max(1, Math.ceil(total / safeLimit)) }
  }

  // ── Write ────────────────────────────────────────────────────────────────

  /**
   * Create a document.
   * @param {object} data
   * @param {string} [preGeneratedId]  Pre-reserved ID from /upload/reserve-id (Option A — RULE 10).
   *                                   If omitted, the next sequential ID is generated automatically.
   */
  async create(data, preGeneratedId = null) {
    const now     = new Date().toISOString()
    const payload = { ...data, createdAt: now, updatedAt: now }

    if (preGeneratedId) {
      await this.ref.doc(preGeneratedId).set(payload)
      return { _id: preGeneratedId, ...payload }
    }

    if (this.idPrefix) {
      const id = await nextId(this.idPrefix)
      await this.ref.doc(id).set(payload)
      return { _id: id, ...payload }
    }

    const docRef = await this.ref.add(payload)
    return { _id: docRef.id, ...payload }
  }

  async update(id, data) {
    const now     = new Date().toISOString()
    const payload = { ...data, updatedAt: now }
    await this.ref.doc(id).update(payload)
    return payload
  }

  async delete(id) {
    await this.ref.doc(id).delete()
    return true
  }

  async batchDelete(ids) {
    const batch = db.batch()
    ids.forEach(id => batch.delete(this.ref.doc(id)))
    await batch.commit()
    return ids.length
  }

  async batchUpdate(ids, data) {
    const batch = db.batch()
    const now   = new Date().toISOString()
    ids.forEach(id => batch.update(this.ref.doc(id), { ...data, updatedAt: now }))
    await batch.commit()
    return ids.length
  }

  async batchSet(items) {
    const batch = db.batch()
    items.forEach(({ id, ...data }) => batch.set(this.ref.doc(id), data, { merge: true }))
    await batch.commit()
  }

  async exists(id) {
    const snap = await this.ref.doc(id).get()
    return snap.exists
  }

  /**
   * Atomically increment a numeric field on a document (RULE 11 — Views & Counts).
   * No-ops silently if the document does not exist.
   * @param {string} id      Document ID
   * @param {string} field   Field name to increment (e.g. 'pageViews', 'cardViews', 'impressions')
   * @param {number} [amount=1]
   */
  async incrementField(id, field, amount = 1) {
    await this.ref.doc(id).update({
      [field]: admin.firestore.FieldValue.increment(amount),
    })
  }

  // ── Recycle Bin (RULE 9) ─────────────────────────────────────────────────

  /**
   * Move a document to the Recycle Bin:
   *   1. Read the full original document.
   *   2. Write it (plus metadata) to the 'recyclebin' collection.
   *   3. Hard-delete from the source collection.
   *
   * The recyclebin document preserves 100% of the original data plus:
   *   originalCollection, originalPublishedAt, originalPublishedBy,
   *   deletedAt, deletedBy, reason, _module, _titleField
   */
  async softDelete(id, { deletedBy = null, reason = 'manual' } = {}) {
    const snap = await this.ref.doc(id).get()
    if (!snap.exists) return false

    const originalData = snap.data()
    const now          = new Date().toISOString()

    await db.collection(RECYCLE_COL).doc(id).set({
      ...originalData,
      // Recyclebin metadata — RULE 9
      originalCollection:  this.col,
      originalPublishedAt: originalData.publishedAt || originalData.createdAt || now,
      originalPublishedBy: originalData.publishedBy || null,
      deletedAt:           now,
      deletedBy,
      reason,
      _module:             this.module,
      _titleField:         this.titleField,
    })

    await this.ref.doc(id).delete()
    return true
  }

  /**
   * Restore a document from the Recycle Bin back to its original collection.
   *   1. Read from 'recyclebin'.
   *   2. Write back to the original collection:
   *        - publishedAt = restoredAt (new publish time)
   *        - originalPublishedAt preserved separately (RULE 9)
   *   3. Hard-delete from 'recyclebin'.
   */
  async restore(id) {
    const snap = await db.collection(RECYCLE_COL).doc(id).get()
    if (!snap.exists) return null

    const {
      originalCollection, originalPublishedAt, originalPublishedBy,
      deletedAt, deletedBy, reason,
      _module, _titleField,
      ...originalFields
    } = snap.data()

    const now = new Date().toISOString()

    await db.collection(originalCollection).doc(id).set({
      ...originalFields,
      publishedAt:         now,                  // RULE 9: publishedAt becomes restoredAt
      restoredAt:          now,
      originalPublishedAt,                       // RULE 9: preserved separately
      originalPublishedBy: originalPublishedBy || null,
      updatedAt:           now,
    })

    await db.collection(RECYCLE_COL).doc(id).delete()
    return { _id: id, originalCollection }
  }

  /**
   * Batch soft-delete: move multiple documents to the Recycle Bin.
   * Processes in chunks of BATCH_SIZE to stay within Firestore batch limits.
   */
  async batchSoftDelete(ids, { deletedBy = null, reason = 'manual' } = {}) {
    if (!ids.length) return 0

    const now   = new Date().toISOString()
    const snaps = await Promise.all(ids.map(id => this.ref.doc(id).get()))
    const valid = snaps.filter(s => s.exists)
    if (!valid.length) return 0

    for (let i = 0; i < valid.length; i += BATCH_SIZE) {
      const chunk = valid.slice(i, i + BATCH_SIZE)
      const batch = db.batch()

      chunk.forEach(snap => {
        const data = snap.data()
        batch.set(db.collection(RECYCLE_COL).doc(snap.id), {
          ...data,
          originalCollection:  this.col,
          originalPublishedAt: data.publishedAt || data.createdAt || now,
          originalPublishedBy: data.publishedBy || null,
          deletedAt:           now,
          deletedBy,
          reason,
          _module:             this.module,
          _titleField:         this.titleField,
        })
        batch.delete(snap.ref)
      })

      await batch.commit()
    }

    return valid.length
  }
}
