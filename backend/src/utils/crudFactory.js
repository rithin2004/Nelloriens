/**
 * crudFactory — generates standard CRUD + category handlers for a Firestore collection.
 *
 * Used by most modules to avoid repeating the same boilerplate.
 */
import { db } from '../config/firebase.js'
import { paginate, getAll } from './pagination.js'
import { ok, created, notFound, badReq, serverErr } from './response.js'
import { log } from './auditLog.js'

/**
 * Create CRUD controllers for a main collection.
 *
 * @param {string} collection  Firestore collection name
 * @param {string} module      Module name used for audit logs & permissions
 * @param {object} opts
 * @param {string} opts.searchField  Field used for in-memory search (default 'title')
 * @param {string} opts.orderBy      Default order field (default 'publishedAt')
 * @param {string} opts.order        'asc' | 'desc' (default 'desc')
 * @param {function} opts.extraFilters  (query) => [[field, op, value], ...] for additional filters
 */
export function crudController(collection, module, opts = {}) {
  const {
    searchField  = 'title',
    orderBy      = 'createdAt',
    order        = 'desc',
    extraFilters = () => [],
  } = opts

  return {
    async list(req, res) {
      try {
        const { page = 1, limit = 20, search = '' } = req.query
        const extra = extraFilters(req.query)

        if (search) {
          const snap = await db.collection(collection)
            .orderBy(orderBy, order)
            .get()
          const all      = snap.docs.map(d => ({ _id: d.id, ...d.data() }))
          const q        = search.toLowerCase()
          const filtered = all.filter(n => n[searchField]?.toLowerCase().includes(q))
          const lim  = Math.min(parseInt(limit) || 20, 100)
          const pg   = Math.max(parseInt(page) || 1, 1)
          const items = filtered.slice((pg - 1) * lim, pg * lim)
          return ok(res, {
            items,
            total:      filtered.length,
            page:       pg,
            totalPages: Math.max(1, Math.ceil(filtered.length / lim)),
          })
        }

        const result = await paginate(collection, { page, limit, orderBy, order, filters: extra })
        ok(res, result)
      } catch (err) { serverErr(res, err) }
    },

    async getById(req, res) {
      try {
        const snap = await db.collection(collection).doc(req.params.id).get()
        if (!snap.exists) return notFound(res, 'Not found')
        ok(res, { data: { _id: snap.id, ...snap.data() } })
      } catch (err) { serverErr(res, err) }
    },

    async create(req, res) {
      try {
        const data = { ...req.body, createdAt: new Date().toISOString() }
        const ref  = await db.collection(collection).add(data)
        await log(req, 'create', module, ref.id, { title: data[searchField] })
        created(res, { data: { _id: ref.id, ...data } })
      } catch (err) { serverErr(res, err) }
    },

    async update(req, res) {
      try {
        const ref  = db.collection(collection).doc(req.params.id)
        const snap = await ref.get()
        if (!snap.exists) return notFound(res, 'Not found')
        const data = { ...req.body, updatedAt: new Date().toISOString() }
        await ref.update(data)
        await log(req, 'update', module, req.params.id, { title: req.body[searchField] })
        ok(res, { data: { _id: req.params.id, ...snap.data(), ...data } })
      } catch (err) { serverErr(res, err) }
    },

    async remove(req, res) {
      try {
        const ref  = db.collection(collection).doc(req.params.id)
        const snap = await ref.get()
        if (!snap.exists) return notFound(res, 'Not found')
        await ref.delete()
        await log(req, 'delete', module, req.params.id, { title: snap.data()[searchField] })
        ok(res, {}, 'Deleted')
      } catch (err) { serverErr(res, err) }
    },
  }
}

/**
 * Create CRUD controllers for a category/location sub-collection.
 *
 * @param {string} collection  Firestore collection name (e.g. 'job_categories')
 */
export function categoryController(collection) {
  return {
    async list(req, res) {
      try {
        const items = await getAll(collection)
        ok(res, { data: items })
      } catch (err) { serverErr(res, err) }
    },

    async create(req, res) {
      try {
        const { name } = req.body
        if (!name?.trim()) return badReq(res, 'name is required')
        const data = { name: name.trim(), createdAt: new Date().toISOString() }
        const ref  = await db.collection(collection).add(data)
        created(res, { data: { _id: ref.id, ...data } })
      } catch (err) { serverErr(res, err) }
    },

    async update(req, res) {
      try {
        const { name } = req.body
        if (!name?.trim()) return badReq(res, 'name is required')
        const ref  = db.collection(collection).doc(req.params.id)
        const snap = await ref.get()
        if (!snap.exists) return notFound(res, 'Not found')
        await ref.update({ name: name.trim(), updatedAt: new Date().toISOString() })
        ok(res, { data: { _id: req.params.id, name: name.trim() } })
      } catch (err) { serverErr(res, err) }
    },

    async remove(req, res) {
      try {
        const ref  = db.collection(collection).doc(req.params.id)
        const snap = await ref.get()
        if (!snap.exists) return notFound(res, 'Not found')
        await ref.delete()
        ok(res, {}, 'Deleted')
      } catch (err) { serverErr(res, err) }
    },
  }
}

/**
 * Standard CRUD router builder.
 *
 * @param {Router} router
 * @param {object} ctrl      Result of crudController()
 * @param {string} module    Module name for permit()
 * @param {object} catCtrl   Result of categoryController() — optional
 * @param {string} catPath   URL prefix for categories (default '/categories')
 */
export function buildCrudRoutes(router, ctrl, module, catCtrl = null, catPath = '/categories') {
  router.get   ('/',     ctrl.list)
  router.get   ('/:id',  ctrl.getById)
  router.post  ('/',     ctrl.create)
  router.put   ('/:id',  ctrl.update)
  router.delete('/:id',  ctrl.remove)

  if (catCtrl) {
    router.get   (catPath,          catCtrl.list)
    router.post  (catPath,          catCtrl.create)
    router.put   (`${catPath}/:id`, catCtrl.update)
    router.delete(`${catPath}/:id`, catCtrl.remove)
  }

  return router
}
