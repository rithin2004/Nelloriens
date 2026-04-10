import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import * as c from './news.controller.js'

const router = Router()
const M = 'news'

// ── IMPORTANT: static sub-paths MUST come before /:id ─────────────────────

// Bulk actions
router.post  ('/bulk-delete',              authenticate, permit(M,'delete'), c.bulkDelete)
router.post  ('/bulk-publish',             authenticate, permit(M,'update'), c.bulkPublish)

// Categories
router.get   ('/categories',               authenticate, permit(M,'read'),   c.listCategories)
router.post  ('/categories',               authenticate, permit(M,'create'), c.createCategory)
router.put   ('/categories/:id',           authenticate, permit(M,'update'), c.updateCategory)
router.delete('/categories/:id',           authenticate, permit(M,'delete'), c.deleteCategory)

// Breaking points — /reorder must come before /:id
router.get   ('/breaking-points',          authenticate, permit(M,'read'),   c.listBreakingPoints)
router.post  ('/breaking-points',          authenticate, permit(M,'create'), c.createBreakingPoint)
router.patch ('/breaking-points/reorder',  authenticate, permit(M,'update'), c.reorderBreakingPoints)
router.put   ('/breaking-points/:id',      authenticate, permit(M,'update'), c.updateBreakingPoint)
router.delete('/breaking-points/:id',      authenticate, permit(M,'delete'), c.deleteBreakingPoint)

// Articles (dynamic :id last)
router.get   ('/',     authenticate, permit(M,'read'),   c.listNews)
router.post  ('/',     authenticate, permit(M,'create'), c.createNews)
router.get   ('/:id',  authenticate, permit(M,'read'),   c.getNews)
router.put   ('/:id',  authenticate, permit(M,'update'), c.updateNews)
router.delete('/:id',  authenticate, permit(M,'delete'), c.deleteNews)

export default router
