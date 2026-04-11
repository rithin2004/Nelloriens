import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { dashboardCtrl } from './dashboard.controller.js'

const router = Router()
const a = asyncHandler

router.get('/stats',          authenticate, permit('dashboard','read'), a(dashboardCtrl.getStats))
router.get('/activity',       authenticate, permit('dashboard','read'), a(dashboardCtrl.getActivity))
router.get('/recent-leads',   authenticate, permit('dashboard','read'), a(dashboardCtrl.getRecentLeads))
router.get('/recent-updates', authenticate, permit('dashboard','read'), a(dashboardCtrl.getRecentUpdates))
router.get('/featured',       authenticate, permit('dashboard','read'), a(dashboardCtrl.getFeatured))

export default router
