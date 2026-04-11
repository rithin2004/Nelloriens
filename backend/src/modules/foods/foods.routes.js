import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as c           from './foods.controller.js'

const router = Router()
const M = 'foods'
const a = asyncHandler

// Photos
router.get   ('/photos/list',                          a(c.listPhotos))
router.post  ('/photos/create',       authenticate, permit(M,'create'), a(c.addPhoto))
router.patch ('/photos/reorder',      authenticate, permit(M,'update'), a(c.reorderPhotos))
router.delete('/photos/delete/:id',   authenticate, permit(M,'delete'), a(c.deletePhoto))

// Varieties
router.get   ('/varieties/list',                          a(c.listVarieties))
router.post  ('/varieties/create',       authenticate, permit(M,'create'), a(c.createVariety))
router.put   ('/varieties/update/:id',   authenticate, permit(M,'update'), a(c.updateVariety))
router.delete('/varieties/delete/:id',   authenticate, permit(M,'delete'), a(c.deleteVariety))

// Sweets
router.get   ('/sweets/list',                          a(c.listSweets))
router.post  ('/sweets/create',       authenticate, permit(M,'create'), a(c.createSweet))
router.put   ('/sweets/update/:id',   authenticate, permit(M,'update'), a(c.updateSweet))
router.delete('/sweets/delete/:id',   authenticate, permit(M,'delete'), a(c.deleteSweet))

// Foods CRUD
router.get   ('/list',                   a(c.list))
router.get   ('/get/:id',                a(c.getById))
router.post  ('/create',     authenticate, permit(M,'create'), a(c.create))
router.put   ('/update/:id', authenticate, permit(M,'update'), a(c.update))
router.delete('/delete/:id', authenticate, permit(M,'delete'), a(c.remove))

export default router
