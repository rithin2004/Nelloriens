import { Router }        from 'express'
import { authenticate }  from '../../middlewares/auth.js'
import { permit }        from '../../middlewares/permissions.js'
import { asyncHandler }  from '../../utils/asyncHandler.js'
import * as c            from './news.controller.js'

const router = Router()
const M = 'news'
const a = asyncHandler

// Bulk actions (write — auth required)
router.post('/delete-batch',  authenticate, permit(M,'delete'), a(c.bulkDelete))
router.post('/publish-batch', authenticate, permit(M,'update'), a(c.bulkPublish))

// Categories
router.get   ('/categories/list',                        a(c.listCategories))
router.post  ('/categories/create',       authenticate, permit(M,'create'), a(c.createCategory))
router.put   ('/categories/update/:id',   authenticate, permit(M,'update'), a(c.updateCategory))
router.delete('/categories/delete/:id',   authenticate, permit(M,'delete'), a(c.deleteCategory))

// Breaking points
router.get   ('/breaking-points/list',                        a(c.listBreakingPoints))
router.post  ('/breaking-points/create',       authenticate, permit(M,'create'), a(c.createBreakingPoint))
router.patch ('/breaking-points/reorder',      authenticate, permit(M,'update'), a(c.reorderBreakingPoints))
router.put   ('/breaking-points/update/:id',   authenticate, permit(M,'update'), a(c.updateBreakingPoint))
router.delete('/breaking-points/delete/:id',   authenticate, permit(M,'delete'), a(c.deleteBreakingPoint))

// Articles CRUD
router.get   ('/list',                   a(c.listNews))
router.get   ('/get/:id',                a(c.getNews))
router.post  ('/create',     authenticate, permit(M,'create'), a(c.createNews))
router.put   ('/update/:id', authenticate, permit(M,'update'), a(c.updateNews))
router.delete('/delete/:id', authenticate, permit(M,'delete'), a(c.deleteNews))

export default router
