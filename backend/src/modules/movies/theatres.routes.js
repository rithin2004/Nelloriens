import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as c           from './movies.controller.js'

const router = Router()
const M = 'theatres'
const a = asyncHandler

router.get   ('/list',                   a(c.listTheatres))
router.post  ('/create',     authenticate, permit(M,'create'), a(c.createTheatre))
router.put   ('/update/:id', authenticate, permit(M,'update'), a(c.updateTheatre))
router.delete('/delete/:id', authenticate, permit(M,'delete'), a(c.removeTheatre))

export default router
