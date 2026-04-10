import { Router } from 'express'
import { authenticate as auth }               from '../../middlewares/auth.js'
import { permit }                             from '../../middlewares/permissions.js'
import { adminsCtrl, siteCtrl, auditCtrl }   from './settings.controller.js'

const router = new Router()

// Admins
router.get   ('/admins',      auth, permit('settings','read'),   adminsCtrl.list)
router.post  ('/admins',      auth, permit('settings','create'), adminsCtrl.create)
router.put   ('/admins/:id',  auth, permit('settings','update'), adminsCtrl.update)
router.delete('/admins/:id',  auth, permit('settings','delete'), adminsCtrl.remove)

// Site config
router.get('/site', auth, permit('settings','read'),   siteCtrl.get)
router.put('/site', auth, permit('settings','update'), siteCtrl.update)

// Audit logs
router.get('/audit-logs', auth, permit('settings','read'), auditCtrl.list)

export default router
