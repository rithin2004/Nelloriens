import { Router } from 'express'
import { authenticate as auth } from '../../middlewares/auth.js'
import { permit }               from '../../middlewares/permissions.js'
import { settingsCtrl, messagesCtrl } from './contact.controller.js'

const router = new Router()

// Settings — static paths first
router.get ('/settings', auth, permit('contact','read'),   settingsCtrl.get)
router.put ('/settings', auth, permit('contact','update'), settingsCtrl.update)

// Messages (leads)
router.get   ('/messages',              auth, permit('contact','read'),   messagesCtrl.list)
router.get   ('/messages/:id',          auth, permit('contact','read'),   messagesCtrl.getById)
router.patch ('/messages/:id/status',   auth, permit('contact','update'), messagesCtrl.updateStatus)
router.delete('/messages/:id',          auth, permit('contact','delete'), messagesCtrl.remove)

export default router
