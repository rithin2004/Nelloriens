import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import * as c from './jobs.controller.js'

const router = Router()
const M = 'jobs'

// Static sub-paths first
router.get   ('/categories',         authenticate, permit(M,'read'),   c.listCategories)
router.post  ('/categories',         authenticate, permit(M,'create'), c.createCategory)
router.put   ('/categories/:id',     authenticate, permit(M,'update'), c.updateCategory)
router.delete('/categories/:id',     authenticate, permit(M,'delete'), c.deleteCategory)

router.get   ('/locations',          authenticate, permit(M,'read'),   c.listLocations)
router.post  ('/locations',          authenticate, permit(M,'create'), c.createLocation)
router.put   ('/locations/:id',      authenticate, permit(M,'update'), c.updateLocation)
router.delete('/locations/:id',      authenticate, permit(M,'delete'), c.deleteLocation)

// Dynamic :id last
router.get   ('/',     authenticate, permit(M,'read'),   c.list)
router.post  ('/',     authenticate, permit(M,'create'), c.create)
router.get   ('/:id',  authenticate, permit(M,'read'),   c.getById)
router.put   ('/:id',  authenticate, permit(M,'update'), c.update)
router.delete('/:id',  authenticate, permit(M,'delete'), c.remove)

export default router
