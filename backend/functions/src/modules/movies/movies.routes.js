import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as c           from './movies.controller.js'

const router = Router()
const M = 'movies'
const a = asyncHandler

// Genres
router.get   ('/genres/list',                          a(c.listGenres))
router.post  ('/genres/create',       authenticate, permit(M,'create'), a(c.createGenre))
router.put   ('/genres/update/:id',   authenticate, permit(M,'update'), a(c.updateGenre))
router.delete('/genres/delete/:id',   authenticate, permit(M,'delete'), a(c.deleteGenre))

// Languages
router.get   ('/languages/list',                          a(c.listLanguages))
router.post  ('/languages/create',       authenticate, permit(M,'create'), a(c.createLanguage))
router.put   ('/languages/update/:id',   authenticate, permit(M,'update'), a(c.updateLanguage))
router.delete('/languages/delete/:id',   authenticate, permit(M,'delete'), a(c.deleteLanguage))

// ── Movies CRUD ────────────────────────────────────────────────────────────
router.get   ('/list',                   a(c.list))
router.get   ('/get/:id',                a(c.getById))
router.post  ('/create',     authenticate, permit(M,'create'), a(c.create))
router.put   ('/update/:id', authenticate, permit(M,'update'), a(c.update))
router.delete('/delete/:id', authenticate, permit(M,'delete'), a(c.remove))

// Public view increments — no auth (RULE 11)
router.post('/:id/views',      a(c.incrementPageViews))
router.post('/:id/card-views', a(c.incrementCardViews))

export default router
