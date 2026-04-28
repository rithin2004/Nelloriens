import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { limitsCtrl }   from './settings.controller.js'

const router = Router()
const a = asyncHandler

// Content limits — Superadmin only (no user has 'settings' permission → only superadmin bypasses)
router.get('/limits/get',    authenticate, permit('settings', 'read'),   a(limitsCtrl.get))
router.put('/limits/update', authenticate, permit('settings', 'update'), a(limitsCtrl.update))

export default router
