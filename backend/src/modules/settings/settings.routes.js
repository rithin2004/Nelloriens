import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { siteCtrl, auditCtrl } from './settings.controller.js'

const router = Router()
const a = asyncHandler

// Site config
router.get('/site/get',    authenticate, permit('settings','read'),   a(siteCtrl.get))
router.put('/site/update', authenticate, permit('settings','update'), a(siteCtrl.update))

// Audit logs
router.get('/audit-logs/list', authenticate, permit('settings','read'), a(auditCtrl.list))

export default router
