import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { leadsCtrl }    from './leads.controller.js'
import rateLimit        from 'express-rate-limit'

const router = Router()
const a = asyncHandler

// Anti-spam: 10 contact form submissions per IP per 15 minutes
const submitLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, message: 'Too many submissions. Please wait before trying again.' },
})

// Public — user-side contact form
router.post('/submit', submitLimit, a(leadsCtrl.submit))

// Admin
router.get   ('/list',         authenticate, permit('leads','read'),   a(leadsCtrl.list))
router.get   ('/get/:id',      authenticate, permit('leads','read'),   a(leadsCtrl.getById))
router.put   ('/update/:id',   authenticate, permit('leads','update'), a(leadsCtrl.update))
router.delete('/delete/:id',   authenticate, permit('leads','delete'), a(leadsCtrl.remove))

// Public view increments — no auth (RULE 11)
router.post('/:id/views',      a(leadsCtrl.incrementPageViews))
router.post('/:id/card-views', a(leadsCtrl.incrementCardViews))

export default router
