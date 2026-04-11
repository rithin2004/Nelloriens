import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { rolesCtrl }    from './roles.controller.js'

const router = Router()
const a = asyncHandler

router.get   ('/list',         authenticate, permit('roles','read'),   a(rolesCtrl.list))
router.get   ('/get/:id',      authenticate, permit('roles','read'),   a(rolesCtrl.getById))
router.post  ('/create',       authenticate, permit('roles','create'), a(rolesCtrl.create))
router.put   ('/update/:id',   authenticate, permit('roles','update'), a(rolesCtrl.update))
router.delete('/delete/:id',   authenticate, permit('roles','delete'), a(rolesCtrl.remove))

export default router
