import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { uploadMiddleware, uploadCtrl } from './upload.controller.js'

const router = Router()
const a = asyncHandler

// GET  /upload/reserve-id?prefix=NEWS — reserve the next sequential ID before upload
router.get   ('/reserve-id', authenticate, a(uploadCtrl.reserveId))
// POST /upload/:module               — authenticated, file field: "file"
router.post  ('/:module',    authenticate, uploadMiddleware, a(uploadCtrl.upload))
router.delete('/delete',     authenticate, a(uploadCtrl.deleteFile))

export default router
