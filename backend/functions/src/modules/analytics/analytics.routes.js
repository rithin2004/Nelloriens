import { Router }       from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { authenticate } from '../../middlewares/auth.js'
import * as c           from './analytics.controller.js'

const router = Router()
const a = asyncHandler

// POST /page-visit — public, no auth (anonymous page visit counting per Rule 11)
router.post('/page-visit', a(c.recordPageVisit))
// GET /page-views — admin only
router.get('/page-views',  authenticate, a(c.getPageViews))

export default router
