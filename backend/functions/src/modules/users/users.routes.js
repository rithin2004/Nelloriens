import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { usersCtrl }    from './users.controller.js'

const router = Router()
const a = asyncHandler

router.get   ('/me',                authenticate,                          a(usersCtrl.me))       // own profile — no permission required
router.patch ('/me',                authenticate,                          a(usersCtrl.updateMe)) // update own name/phone
router.get   ('/list',              authenticate, permit('users','read'),   a(usersCtrl.list))
router.get   ('/get/:id',           authenticate, permit('users','read'),   a(usersCtrl.getById))
router.post  ('/create',            authenticate, permit('users','create'), a(usersCtrl.create))
router.put   ('/update/:id',        authenticate, permit('users','update'), a(usersCtrl.update))
router.delete('/delete/:id',        authenticate, permit('users','delete'), a(usersCtrl.remove))
router.get   ('/reset-link/:id',    authenticate, permit('users','update'), a(usersCtrl.getResetLink))

export default router
