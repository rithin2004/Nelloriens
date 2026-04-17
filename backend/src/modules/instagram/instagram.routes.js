import { Router }        from 'express'
import { authenticate }  from '../../middlewares/auth.js'
import { permit }        from '../../middlewares/permissions.js'
import { asyncHandler }  from '../../utils/asyncHandler.js'
import { instagramCtrl } from './instagram.controller.js'

const router = Router()
const a = asyncHandler

// Settings (connect / disconnect Instagram account)
router.get   ('/settings/get',        authenticate, permit('instagram','read'),   a(instagramCtrl.getSettings))
router.post  ('/settings/connect',    authenticate, permit('instagram','update'), a(instagramCtrl.connect))
router.delete('/settings/disconnect', authenticate, permit('instagram','update'), a(instagramCtrl.disconnect))

// Status & posts
router.get   ('/status',          authenticate, permit('instagram','read'),   a(instagramCtrl.getStatus))
router.get   ('/posts/list',                                                   a(instagramCtrl.getPosts))
router.post  ('/posts/create',    authenticate, permit('instagram','create'), a(instagramCtrl.createPost))
router.put   ('/posts/update/:id',authenticate, permit('instagram','update'), a(instagramCtrl.updatePost))
router.post  ('/sync',            authenticate, permit('instagram','create'), a(instagramCtrl.sync))
router.post  ('/refresh-token',   authenticate, permit('instagram','update'), a(instagramCtrl.refreshToken))
router.delete('/delete/:id',      authenticate, permit('instagram','delete'), a(instagramCtrl.hidePost))

// Public count increments — no auth (RULE 11)
router.post('/posts/:id/views',       a(instagramCtrl.incrementPageViews))
router.post('/posts/:id/card-views',  a(instagramCtrl.incrementCardViews))
router.post('/posts/:id/impressions', a(instagramCtrl.incrementImpressions))
router.post('/posts/:id/touches',     a(instagramCtrl.incrementTouches))

export default router
