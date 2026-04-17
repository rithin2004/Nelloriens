import { Router }       from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { search }       from './search.controller.js'

const router = Router()

// Public — no auth required for user-facing global search (RULE 16)
router.get('/', asyncHandler(search))

export default router
