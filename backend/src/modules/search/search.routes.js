import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { search }        from './search.controller.js'

const router = Router()

router.get('/', authenticate, permit('search','read'), asyncHandler(search))

export default router
