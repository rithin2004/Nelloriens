import { Router } from 'express'
import { authenticate as auth } from '../../middlewares/auth.js'
import { permit }               from '../../middlewares/permissions.js'
import { instagramCtrl }        from './instagram.controller.js'

const router = new Router()

// Static routes before /:id
router.get ('/status',        auth, permit('instagram','read'),   instagramCtrl.getStatus)
router.get ('/posts',         auth, permit('instagram','read'),   instagramCtrl.getPosts)
router.post('/sync',          auth, permit('instagram','create'), instagramCtrl.sync)
router.post('/refresh-token', auth, permit('instagram','update'), instagramCtrl.refreshToken)

// Dynamic
router.delete('/:id', auth, permit('instagram','delete'), instagramCtrl.hidePost)

export default router
