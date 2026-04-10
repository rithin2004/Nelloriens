/**
 * Controller factory — creates standard request handlers from a CrudService / CategoryService.
 * Keeps each module's controller.js minimal.
 */
import { handleErr } from './serviceBase.js'
import { log }       from './auditLog.js'

export function makeCrudController(service, module) {
  return {
    async list(req, res) {
      try { res.json({ success: true, ...(await service.list(req.query)) }) }
      catch (err) { handleErr(res, err) }
    },
    async getById(req, res) {
      try { res.json({ success: true, data: await service.getById(req.params.id) }) }
      catch (err) { handleErr(res, err) }
    },
    async create(req, res) {
      try {
        const data = await service.create(req.body)
        await log(req, 'create', module, data._id, { title: data.title || data.name })
        res.status(201).json({ success: true, message: 'Created', data })
      } catch (err) { handleErr(res, err) }
    },
    async update(req, res) {
      try {
        const data = await service.update(req.params.id, req.body)
        await log(req, 'update', module, req.params.id)
        res.json({ success: true, message: 'Updated', data })
      } catch (err) { handleErr(res, err) }
    },
    async remove(req, res) {
      try {
        await service.remove(req.params.id)
        await log(req, 'delete', module, req.params.id)
        res.json({ success: true, message: 'Deleted' })
      } catch (err) { handleErr(res, err) }
    },
  }
}

export function makeCategoryController(service) {
  return {
    async list(req, res) {
      try { res.json({ success: true, data: await service.list() }) }
      catch (err) { handleErr(res, err) }
    },
    async create(req, res) {
      try { res.status(201).json({ success: true, data: await service.create(req.body.name) }) }
      catch (err) { handleErr(res, err) }
    },
    async update(req, res) {
      try { res.json({ success: true, data: await service.update(req.params.id, req.body.name) }) }
      catch (err) { handleErr(res, err) }
    },
    async remove(req, res) {
      try { await service.remove(req.params.id); res.json({ success: true, message: 'Deleted' }) }
      catch (err) { handleErr(res, err) }
    },
  }
}

/**
 * Attach standard CRUD routes to a router.
 * Pass catCtrl to also wire up /categories sub-routes.
 * Pass extra static path registrations via `before` callback for custom sub-paths.
 */
export function buildRoutes(router, ctrl, auth, permit, module, { catCtrl, locCtrl, extraStatic } = {}) {
  // Extra static routes (must run before :id)
  if (extraStatic) extraStatic(router)

  if (catCtrl) {
    router.get   ('/categories',         auth, permit(module,'read'),   catCtrl.list)
    router.post  ('/categories',         auth, permit(module,'create'), catCtrl.create)
    router.put   ('/categories/:id',     auth, permit(module,'update'), catCtrl.update)
    router.delete('/categories/:id',     auth, permit(module,'delete'), catCtrl.remove)
  }

  if (locCtrl) {
    router.get   ('/locations',          auth, permit(module,'read'),   locCtrl.list)
    router.post  ('/locations',          auth, permit(module,'create'), locCtrl.create)
    router.put   ('/locations/:id',      auth, permit(module,'update'), locCtrl.update)
    router.delete('/locations/:id',      auth, permit(module,'delete'), locCtrl.remove)
  }

  // Dynamic :id last
  router.get   ('/',     auth, permit(module,'read'),   ctrl.list)
  router.post  ('/',     auth, permit(module,'create'), ctrl.create)
  router.get   ('/:id',  auth, permit(module,'read'),   ctrl.getById)
  router.put   ('/:id',  auth, permit(module,'update'), ctrl.update)
  router.delete('/:id',  auth, permit(module,'delete'), ctrl.remove)

  return router
}
