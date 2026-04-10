/**
 * Base service helpers used by all module services.
 */
import { FirestoreRepo } from './firestoreRepo.js'

/** Throw a structured HTTP error that controllers can catch */
export function httpError(status, message) {
  const err = new Error(message)
  err.status = status
  throw err
}

export const notFound = (msg = 'Not found')    => httpError(404, msg)
export const badReq   = (msg = 'Bad request')  => httpError(400, msg)
export const forbidden= (msg = 'Forbidden')    => httpError(403, msg)

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
   * @param {function}      opts.validate    (data) => void — throw if invalid
   */
  constructor(repo, opts = {}) {
    this.repo        = repo
    this.entityName  = opts.entityName  || 'Item'
    this.searchField = opts.searchField || 'title'
    this.orderBy     = opts.orderBy     || 'createdAt'
    this.order       = opts.order       || 'desc'
    this.validate    = opts.validate    || (() => {})
    this.extraFilters= opts.extraFilters|| (() => [])
  }

  async list(query = {}) {
    const { page = 1, limit = 20, search = '' } = query

    if (search) {
      const all      = await this.repo.findAll({ orderBy: this.orderBy, order: this.order })
      const q        = search.toLowerCase()
      const filtered = all.filter(item => item[this.searchField]?.toLowerCase().includes(q))
      const lim      = Math.min(parseInt(limit) || 20, 100)
      const pg       = Math.max(parseInt(page)  || 1, 1)
      return {
        items:      filtered.slice((pg - 1) * lim, pg * lim),
        total:      filtered.length,
        page:       pg,
        totalPages: Math.max(1, Math.ceil(filtered.length / lim)),
      }
    }

    return this.repo.paginate({
      page, limit,
      orderBy: this.orderBy,
      order:   this.order,
      filters: this.extraFilters(query),
    })
  }

  async getById(id) {
    const item = await this.repo.findById(id)
    if (!item) notFound(`${this.entityName} not found`)
    return item
  }

  async create(data) {
    this.validate(data)
    return this.repo.create(data)
  }

  async update(id, data) {
    const existing = await this.repo.findById(id)
    if (!existing) notFound(`${this.entityName} not found`)
    this.validate(data)
    return this.repo.update(id, data)
  }

  async remove(id) {
    const existing = await this.repo.findById(id)
    if (!existing) notFound(`${this.entityName} not found`)
    await this.repo.delete(id)
    return existing
  }
}

/**
 * Category service factory (name-only entities).
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

/** HTTP error handler for controllers */
export function handleErr(res, err) {
  const status = err.status || 500
  if (status >= 500) console.error('[ERROR]', err)
  return res.status(status).json({ success: false, message: err.message || 'Internal server error' })
}
