/**
 * Base Firestore Repository
 * Wraps common Firestore operations so every module repository
 * uses a consistent, tested data-access layer.
 */
import { db }     from '../config/firebase.js'
import { nextId } from './sequentialId.js'

export class FirestoreRepo {
  /**
   * @param {string} collection  Firestore collection name
   * @param {object} opts
   * @param {string} [opts.idPrefix]  If set, IDs are generated as PREFIX00001 via sequential counter
   */
  constructor(collection, { idPrefix } = {}) {
    this.col      = collection
    this.ref      = db.collection(collection)
    this.idPrefix = idPrefix || null
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

  async create(data) {
    const now     = new Date().toISOString()
    const payload = { ...data, createdAt: now, updatedAt: now }

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

  // ── Soft delete (Recycle Bin) ─────────────────────────────────────────────

  /**
   * Soft-delete a document: sets deletedAt/deletedBy/deleteReason instead of removing.
   * The document stays in the same collection but is excluded from all list/get queries.
   */
  async softDelete(id, { deletedBy = null, deleteReason = 'manual' } = {}) {
    const now = new Date().toISOString()
    await this.ref.doc(id).update({ deletedAt: now, deletedBy, deleteReason, updatedAt: now })
    return true
  }

  /**
   * Restore a soft-deleted document back to live state.
   */
  async restore(id) {
    const now = new Date().toISOString()
    await this.ref.doc(id).update({ deletedAt: null, deletedBy: null, deleteReason: null, updatedAt: now })
    return true
  }

  /**
   * Batch soft-delete multiple documents.
   */
  async batchSoftDelete(ids, { deletedBy = null, deleteReason = 'manual' } = {}) {
    const batch = db.batch()
    const now   = new Date().toISOString()
    ids.forEach(id => batch.update(this.ref.doc(id), { deletedAt: now, deletedBy, deleteReason, updatedAt: now }))
    await batch.commit()
    return ids.length
  }
}
