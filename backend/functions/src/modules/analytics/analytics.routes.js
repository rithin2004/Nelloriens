import { Router }       from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as c           from './analytics.controller.js'

const router = Router()
const a = asyncHandler

// Public — no auth required (RULE 11: anonymous counting supported)
router.post('/page-visit', a(c.recordPageVisit))
router.get('/page-views',  a(c.getPageViews))

export default router
