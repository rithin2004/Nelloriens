import { Router }      from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import * as c           from './foods.controller.js'

const router = Router()
const M = 'foods'

// ── Photos — static before /:id ───────────────────────────────────────────
router.get   ('/photos',         authenticate, permit(M,'read'),   c.listPhotos)
router.post  ('/photos',         authenticate, permit(M,'create'), c.addPhoto)
router.patch ('/photos/reorder', authenticate, permit(M,'update'), c.reorderPhotos)
router.delete('/photos/:id',     authenticate, permit(M,'delete'), c.deletePhoto)

// ── Varieties ─────────────────────────────────────────────────────────────
router.get   ('/varieties',      authenticate, permit(M,'read'),   c.listVarieties)
router.post  ('/varieties',      authenticate, permit(M,'create'), c.createVariety)
router.put   ('/varieties/:id',  authenticate, permit(M,'update'), c.updateVariety)
router.delete('/varieties/:id',  authenticate, permit(M,'delete'), c.deleteVariety)

// ── Sweets ────────────────────────────────────────────────────────────────
router.get   ('/sweets',         authenticate, permit(M,'read'),   c.listSweets)
router.post  ('/sweets',         authenticate, permit(M,'create'), c.createSweet)
router.put   ('/sweets/:id',     authenticate, permit(M,'update'), c.updateSweet)
router.delete('/sweets/:id',     authenticate, permit(M,'delete'), c.deleteSweet)

// ── Foods CRUD ────────────────────────────────────────────────────────────
router.get   ('/',    authenticate, permit(M,'read'),   c.list)
router.post  ('/',    authenticate, permit(M,'create'), c.create)
router.get   ('/:id', authenticate, permit(M,'read'),   c.getById)
router.put   ('/:id', authenticate, permit(M,'update'), c.update)
router.delete('/:id', authenticate, permit(M,'delete'), c.remove)

export default router
