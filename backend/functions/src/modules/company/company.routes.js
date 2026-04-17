import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { companyCtrl }  from './company.controller.js'

const router = Router()
const a = asyncHandler

router.get ('/get',    a(companyCtrl.get))                                              // public
router.post('/create', authenticate, permit('company','create'), a(companyCtrl.create))
router.put ('/update', authenticate, permit('company','update'), a(companyCtrl.update))

export default router
