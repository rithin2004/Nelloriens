import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as c           from './sponsorships.controller.js'

const router = Router()
const M = 'sponsorships'
const a = asyncHandler

router.get   ('/list',                   a(c.list))
router.get   ('/get/:id',                a(c.getById))
router.post  ('/create',     authenticate, permit(M,'create'), a(c.create))
router.put   ('/update/:id', authenticate, permit(M,'update'), a(c.update))
router.delete('/delete/:id', authenticate, permit(M,'delete'), a(c.remove))

// Public count increments — no auth (RULE 11)
router.post('/:id/views',       a(c.incrementPageViews))
router.post('/:id/card-views',  a(c.incrementCardViews))
router.post('/:id/impressions', a(c.incrementImpressions))
router.post('/:id/clicks',      a(c.incrementClicks))

export default router
