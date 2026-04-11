import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as c           from './ads.controller.js'

const router = Router()
const M = 'ads'
const a = asyncHandler

// Manual Ads CRUD
router.get   ('/list',                   a(c.list))
router.get   ('/get/:id',                a(c.getById))
router.post  ('/create',     authenticate, permit(M,'create'), a(c.create))
router.put   ('/update/:id', authenticate, permit(M,'update'), a(c.update))
router.delete('/delete/:id', authenticate, permit(M,'delete'), a(c.remove))

// AdSense settings
router.get   ('/settings/get',        authenticate, permit(M,'read'),   a(c.getAdsenseSettings))
router.post  ('/settings/connect',    authenticate, permit(M,'update'), a(c.connectAdsense))
router.put   ('/settings/update',     authenticate, permit(M,'update'), a(c.updateAdsense))
router.delete('/settings/disconnect', authenticate, permit(M,'update'), a(c.disconnectAdsense))

export default router
