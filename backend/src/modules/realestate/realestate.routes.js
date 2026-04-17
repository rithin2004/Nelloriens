import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as c           from './realestate.controller.js'

const router = Router()
const M = 'realestate'
const a = asyncHandler

// Locations
router.get   ('/locations/list',                          a(c.listLocations))
router.post  ('/locations/create',       authenticate, permit(M,'create'), a(c.createLocation))
router.put   ('/locations/update/:id',   authenticate, permit(M,'update'), a(c.updateLocation))
router.delete('/locations/delete/:id',   authenticate, permit(M,'delete'), a(c.deleteLocation))

// Property Types
router.get   ('/types/list',                          a(c.listTypes))
router.post  ('/types/create',       authenticate, permit(M,'create'), a(c.createType))
router.put   ('/types/update/:id',   authenticate, permit(M,'update'), a(c.updateType))
router.delete('/types/delete/:id',   authenticate, permit(M,'delete'), a(c.deleteType))

// Listings CRUD
router.get   ('/list',                   a(c.list))
router.get   ('/get/:id',                a(c.getById))
router.post  ('/create',     authenticate, permit(M,'create'), a(c.create))
router.put   ('/update/:id', authenticate, permit(M,'update'), a(c.update))
router.delete('/delete/:id', authenticate, permit(M,'delete'), a(c.remove))

// Public view increments (RULE 11)
router.post('/:id/views',      a(c.incrementPageViews))
router.post('/:id/card-views', a(c.incrementCardViews))

export default router
