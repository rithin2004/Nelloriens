import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as c           from './sports.controller.js'

const router = Router()
const M = 'sports'
const a = asyncHandler

// Categories
router.get   ('/categories/list',                          a(c.listCategories))
router.post  ('/categories/create',       authenticate, permit(M,'create'), a(c.createCategory))
router.put   ('/categories/update/:id',   authenticate, permit(M,'update'), a(c.updateCategory))
router.delete('/categories/delete/:id',   authenticate, permit(M,'delete'), a(c.deleteCategory))

// Live Scores
router.get   ('/live-scores/list',                         a(c.listLiveScores))
router.post  ('/live-scores/create',      authenticate, permit(M,'create'), a(c.createLiveScore))
router.put   ('/live-scores/update/:id',  authenticate, permit(M,'update'), a(c.updateLiveScore))
router.delete('/live-scores/delete/:id',  authenticate, permit(M,'delete'), a(c.deleteLiveScore))

// Sports CRUD
router.get   ('/list',                   a(c.list))
router.get   ('/get/:id',                a(c.getById))
router.post  ('/create',     authenticate, permit(M,'create'), a(c.create))
router.put   ('/update/:id', authenticate, permit(M,'update'), a(c.update))
router.delete('/delete/:id', authenticate, permit(M,'delete'), a(c.remove))

// Public view increments — no auth (RULE 11)
router.post('/:id/views',      a(c.incrementPageViews))
router.post('/:id/card-views', a(c.incrementCardViews))

export default router
