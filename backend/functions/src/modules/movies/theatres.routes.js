import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as c           from './movies.controller.js'

const router = Router()
const M = 'theatres'
const a = asyncHandler

// ── Theatres CRUD ───────────────────────────────────────────────────────────
router.get   ('/list',                   a(c.listTheatres))
router.post  ('/create',     authenticate, permit(M,'create'), a(c.createTheatre))
router.put   ('/update/:id', authenticate, permit(M,'update'), a(c.updateTheatre))
router.delete('/delete/:id', authenticate, permit(M,'delete'), a(c.removeTheatre))

// ── Showtimes (per theatre) ─────────────────────────────────────────────────
// Public — user frontend hits /theatres/:theatreId/showtimes/active
router.get('/:theatreId/showtimes/list',   a(c.listShowtimes))
router.get('/:theatreId/showtimes/active', a(c.listActiveShowtimes))

// Protected — admin create/update/delete
router.post  ('/:theatreId/showtimes/create',      authenticate, permit(M,'create'), a(c.createShowtime))
router.put   ('/showtimes/update/:id',             authenticate, permit(M,'update'), a(c.updateShowtime))
router.delete('/showtimes/delete/:id',             authenticate, permit(M,'delete'), a(c.removeShowtime))

export default router
