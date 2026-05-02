/**
 * Base service helpers used by all module services.
 *
 * RULE 9 NOTE: All deleted items now live in the 'recyclebin' collection.
 * The original collection never contains soft-deleted documents, so no
 * deletedAt filtering is needed anywhere in list/getById/update.
 */

/** Throw a structured HTTP error that controllers can catch */
export function httpError(status, message) {
  const err = new Error(message)
  err.status = status
  throw err
}

export const notFound = (msg = 'Not found')   => httpError(404, msg)
export const badReq   = (msg = 'Bad request') => httpError(400, msg)
export const forbidden= (msg = 'Forbidden')   => httpError(403, msg)

/** Unified error responder for controller catch blocks */
export function handleErr(res, err) {
  const status = err.status || 500
  if (status >= 500) console.error('[SERVER]', err)
  res.status(status).json({ success: false, message: err.message || 'Internal server error' })
}

/**
 * Generic CRUD service factory.
 * Wraps a FirestoreRepo with standard list/get/create/update/remove operations.
 * Each module can extend or override as needed.
 */
export class CrudService {
  /**
   * @param {FirestoreRepo} repo
   * @param {object}        opts
   * @param {string}        opts.entityName  Display name for error messages (e.g. 'News article')
   * @param {string}        opts.searchField Field to search in (default 'title')
   * @param {string}        opts.orderBy     Default sort field (default 'createdAt')
   * @param {string}        opts.order       'asc'|'desc' (default 'desc')
   * @param {string}        opts.titleField  Field used as display title in recyclebin (default 'title')
   * @param {function}      opts.validate    (data) => void — throw if invalid
   * @param {function}      opts.extraFilters (query) => [[field, op, value], ...] — additional JS filters
   */
  constructor(repo, opts = {}) {
    this.repo        = repo
    this.entityName  = opts.entityName  || 'Item'
    this.searchField = opts.searchField || 'title'
    this.orderBy     = opts.orderBy     || 'createdAt'
    this.order       = opts.order       || 'desc'
    this.titleField  = opts.titleField  || 'title'
    this.validate    = opts.validate    || (() => {})
    this.extraFilters= opts.extraFilters|| (() => [])
  }

  async list(query = {}) {
    const { page = 1, limit = 20, search = '' } = query
    const lim = Math.min(parseInt(limit) || 20, 100)
    const pg  = Math.max(parseInt(page)  || 1,  1)

    const firestoreFilters = []
    const inMemoryFilters  = []

    // Split filters: '==' can go to Firestore (if user has composite indexes), 
    // but inequalities MUST be in-memory because Firestore forbids them if orderBy !== field
    for (const [field, op, value] of this.extraFilters(query)) {
      if (value !== undefined && value !== null && value !== '' && value !== 'All') {
        if (op === '==') firestoreFilters.push([field, op, value])
        else             inMemoryFilters.push([field, op, value])
      }
    }

    // Fast path: No text search AND no complex in-memory filters -> Firestore paginate
    if (!search && inMemoryFilters.length === 0) {
      return this.repo.paginate({
        page:    pg,
        limit:   lim,
        orderBy: this.orderBy,
        order:   this.order,
        filters: firestoreFilters,
      })
    }

    // Slow path: Text search OR inequalities -> fetch narrowed dataset, filter in-memory
    let items = await this.repo.findAll({
      orderBy: this.orderBy,
      order:   this.order,
      filters: firestoreFilters,
    })

    // Apply JS inequalities
    for (const [field, op, value] of inMemoryFilters) {
      if      (op === '!=') items = items.filter(item => item[field] !== value)
      else if (op === 'in') items = items.filter(item => Array.isArray(value) && value.includes(item[field]))
      else if (op === '>=') items = items.filter(item => item[field] >= value)
      else if (op === '<=') items = items.filter(item => item[field] <= value)
    }

    if (search) {
      const q = search.toLowerCase()
      items = items.filter(item => item[this.searchField]?.toLowerCase().includes(q))
    }

    return {
      items:      items.slice((pg - 1) * lim, pg * lim),
      total:      items.length,
      page:       pg,
      totalPages: Math.max(1, Math.ceil(items.length / lim)),
    }
  }

  async getById(id) {
    const item = await this.repo.findById(id)
    if (!item) notFound(`${this.entityName} not found`)
    return item
  }

  async create(data) {
    // _reservedId is sent by the frontend (pre-reserved via /upload/reserve-id) so
    // the file is already named after the content ID before the document is created.
    // Strip it from the stored payload — it's only used to set the document ID.
    const { _reservedId, ...rest } = data
    this.validate(rest)
    return this.repo.create(rest, _reservedId || null)
  }

  async update(id, data) {
    const existing = await this.repo.findById(id)
    if (!existing) notFound(`${this.entityName} not found`)
    this.validate(data)
    return this.repo.update(id, data)
  }

  /**
   * Move the item to the Recycle Bin (RULE 9).
   * Copies full document to 'recyclebin' collection, hard-deletes from source.
   * @param {string} id
   * @param {object} requestUser — req.user from the authenticated request (optional)
   */
  /**
   * Atomically increment a view/count field (RULE 11).
   * No auth required — called from public endpoints.
   */
  async incrementViews(id, field) {
    await this.repo.incrementField(id, field)
  }

  async remove(id, requestUser = null) {
    const existing = await this.repo.findById(id)
    if (!existing) notFound(`${this.entityName} not found`)
    await this.repo.softDelete(id, {
      deletedBy: requestUser?.uid || null,
      reason:    'manual',
    })
    return existing
  }
}

/**
 * Category service factory (name-only entities).
 * Categories are hard-deleted (not soft-deleted) — they are configuration, not content.
 */
export class CategoryService {
  constructor(repo, entityName = 'Category') {
    this.repo       = repo
    this.entityName = entityName
  }

  async list() {
    return this.repo.findAll({ orderBy: 'name', order: 'asc' })
  }

  async create(name) {
    if (!name?.trim()) badReq('name is required')
    return this.repo.create({ name: name.trim() })
  }

  async update(id, name) {
    if (!name?.trim()) badReq('name is required')
    const existing = await this.repo.findById(id)
    if (!existing) notFound(`${this.entityName} not found`)
    return this.repo.update(id, { name: name.trim() })
  }

  async remove(id) {
    const existing = await this.repo.findById(id)
    if (!existing) notFound(`${this.entityName} not found`)
    await this.repo.delete(id)
  }
}
