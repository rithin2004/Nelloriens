import { Router } from 'express'
import { authenticate as auth } from '../../middlewares/auth.js'
import { permit }               from '../../middlewares/permissions.js'
import { dashboardCtrl }        from './dashboard.controller.js'

const router = new Router()

router.get('/stats',          auth, permit('dashboard','read'), dashboardCtrl.getStats)
router.get('/activity',       auth, permit('dashboard','read'), dashboardCtrl.getActivity)
router.get('/recent-leads',   auth, permit('dashboard','read'), dashboardCtrl.getRecentLeads)
router.get('/recent-updates', auth, permit('dashboard','read'), dashboardCtrl.getRecentUpdates)
router.get('/featured',       auth, permit('dashboard','read'), dashboardCtrl.getFeatured)

export default router
