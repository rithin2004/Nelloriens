import { Router }      from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import * as c           from './movies.controller.js'

const router = Router()
const M = 'theatres'

router.get   ('/',    authenticate, permit(M,'read'),   c.listTheatres)
router.post  ('/',    authenticate, permit(M,'create'), c.createTheatre)
router.put   ('/:id', authenticate, permit(M,'update'), c.updateTheatre)
router.delete('/:id', authenticate, permit(M,'delete'), c.removeTheatre)

export default router
