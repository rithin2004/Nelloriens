import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as c           from './events.controller.js'

const router = Router()
const M = 'events'
const a = asyncHandler

// Categories
router.get   ('/categories/list',                          a(c.listCategories))
router.post  ('/categories/create',       authenticate, permit(M,'create'), a(c.createCategory))
router.put   ('/categories/update/:id',   authenticate, permit(M,'update'), a(c.updateCategory))
router.delete('/categories/delete/:id',   authenticate, permit(M,'delete'), a(c.deleteCategory))

// Events CRUD
router.get   ('/list',                   a(c.list))
router.get   ('/get/:id',                a(c.getById))
router.post  ('/create',     authenticate, permit(M,'create'), a(c.create))
router.put   ('/update/:id', authenticate, permit(M,'update'), a(c.update))
router.delete('/delete/:id', authenticate, permit(M,'delete'), a(c.remove))

// Public view increments — no auth (RULE 11)
router.post('/:id/views',      a(c.incrementPageViews))
router.post('/:id/card-views', a(c.incrementCardViews))

// ── Influencer Events (RULE 27 — separate section, no categories, max 5 globally) ──
router.get   ('/influencer/list',                   a(c.listInfluencerEvents))
router.get   ('/influencer/get/:id',                a(c.getInfluencerEventById))
router.post  ('/influencer/create',     authenticate, permit(M,'create'), a(c.createInfluencerEvent))
router.put   ('/influencer/update/:id', authenticate, permit(M,'update'), a(c.updateInfluencerEvent))
router.delete('/influencer/delete/:id', authenticate, permit(M,'delete'), a(c.removeInfluencerEvent))
// Influencer event view increments — public
router.post('/influencer/:id/views',      a(c.incrementInfluencerPageViews))
router.post('/influencer/:id/card-views', a(c.incrementInfluencerCardViews))

export default router
