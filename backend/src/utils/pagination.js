import { db } from '../config/firebase.js'

/**
 * Paginate a Firestore collection.
 *
 * @param {string}   collection   - Collection name
 * @param {object}   opts
 * @param {number}   opts.page    - 1-based page number (default 1)
 * @param {number}   opts.limit   - Items per page (default 20, max 100)
 * @param {string}   opts.orderBy - Field to order by (default 'createdAt')
 * @param {string}   opts.order   - 'asc' | 'desc' (default 'desc')
 * @param {Array}    opts.filters - Array of [field, op, value] triples
 *
 * @returns {{ items: object[], total: number, page: number, totalPages: number }}
 */
export async function paginate(collection, {
  page    = 1,
  limit   = 20,
  orderBy = 'createdAt',
  order   = 'desc',
  filters = [],
} = {}) {
  const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100)
  const safePage  = Math.max(parseInt(page) || 1, 1)
  const offset    = (safePage - 1) * safeLimit

  let ref = db.collection(collection)

  // Apply filters
  for (const [field, op, value] of filters) {
    if (value !== undefined && value !== null && value !== '') {
      ref = ref.where(field, op, value)
    }
  }

  // Count total (separate query)
  const countSnap = await ref.count().get()
  const total     = countSnap.data().count

  // Fetch page
  const snap = await ref
    .orderBy(orderBy, order)
    .offset(offset)
    .limit(safeLimit)
    .get()

  const items = snap.docs.map(doc => ({ id: doc.id, _id: doc.id, ...doc.data() }))

  return {
    items,
    total,
    page:       safePage,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  }
}

/**
 * Get all documents from a collection (no pagination).
 * Used for categories, locations, etc.
 */
export async function getAll(collection, {
  orderBy = 'name',
  order   = 'asc',
  filters = [],
} = {}) {
  let ref = db.collection(collection)
  for (const [field, op, value] of filters) {
    if (value !== undefined && value !== null && value !== '') {
      ref = ref.where(field, op, value)
    }
  }
  const snap = await ref.orderBy(orderBy, order).get()
  return snap.docs.map(doc => ({ id: doc.id, _id: doc.id, ...doc.data() }))
}

/**
 * Simple prefix search filter helper.
 * Firestore supports prefix-range queries for text search.
 * Returns filters array entries to add to paginate().
 */
export function searchFilter(field, value) {
  if (!value) return []
  const end = value + '\uf8ff'
  return [
    [field, '>=', value],
    [field, '<=', end],
  ]
}
