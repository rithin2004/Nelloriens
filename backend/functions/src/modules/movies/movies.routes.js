import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as c           from './movies.controller.js'

const router = Router()
const M = 'movies'
const a = asyncHandler

// ── Movies CRUD ────────────────────────────────────────────────────────────
router.get   ('/list',                   a(c.list))
router.get   ('/get/:id',                a(c.getById))
router.post  ('/create',     authenticate, permit(M,'create'), a(c.create))
router.put   ('/update/:id', authenticate, permit(M,'update'), a(c.update))
router.delete('/delete/:id', authenticate, permit(M,'delete'), a(c.remove))

// ── Trailers (RULE 35 — separate section) ─────────────────────────────────
router.get   ('/trailers/list',                    a(c.listTrailers))
router.get   ('/trailers/get/:id',                 a(c.getTrailerById))
router.post  ('/trailers/create',     authenticate, permit(M,'create'), a(c.createTrailer))
router.put   ('/trailers/update/:id', authenticate, permit(M,'update'), a(c.updateTrailer))
router.delete('/trailers/delete/:id', authenticate, permit(M,'delete'), a(c.removeTrailer))

// Public view increments — no auth (RULE 11)
router.post('/:id/views',               a(c.incrementPageViews))
router.post('/:id/card-views',          a(c.incrementCardViews))
router.post('/trailers/:id/views',      a(c.incrementTrailerPageViews))
router.post('/trailers/:id/card-views', a(c.incrementTrailerCardViews))

export default router
