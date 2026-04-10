import { Router }      from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import * as c           from './history.controller.js'

const router = Router()
const M = 'history'

// Static before /:id
router.patch ('/reorder', authenticate, permit(M,'update'), c.reorder)

// CRUD
router.get   ('/',    authenticate, permit(M,'read'),   c.list)
router.post  ('/',    authenticate, permit(M,'create'), c.create)
router.get   ('/:id', authenticate, permit(M,'read'),   c.getById)
router.put   ('/:id', authenticate, permit(M,'update'), c.update)
router.delete('/:id', authenticate, permit(M,'delete'), c.remove)

export default router
