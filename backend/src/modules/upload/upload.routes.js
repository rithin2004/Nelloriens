import { Router } from 'express'
import { authenticate as auth }             from '../../middlewares/auth.js'
import { uploadMiddleware, uploadCtrl }     from './upload.controller.js'

const router = new Router()

router.post  ('/', auth, uploadMiddleware, uploadCtrl.upload)
router.delete('/', auth, uploadCtrl.deleteFile)

export default router
