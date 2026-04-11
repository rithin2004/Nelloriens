import { Router }       from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { setupCtrl }    from './setup.controller.js'

const router = Router()
const a = asyncHandler

// Public — no auth (these run before any user exists)
router.get ('/status',           a(setupCtrl.status))
router.post('/create-superadmin', a(setupCtrl.bootstrap))

export default router
