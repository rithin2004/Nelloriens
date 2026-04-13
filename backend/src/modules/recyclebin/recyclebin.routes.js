import { Router }       from 'express'
import { authenticate } from '../../middlewares/auth.js'
import { permit }       from '../../middlewares/permissions.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as c           from './recyclebin.controller.js'

const router = Router()
const a = asyncHandler
const M = 'recyclebin'

// All recycle bin routes require authentication

// Stats — count of items per module
router.get('/stats',                           authenticate, permit(M, 'read'),   a(c.stats))

// List all soft-deleted items (paginated, filterable by module)
router.get('/list',                            authenticate, permit(M, 'read'),   a(c.list))

// Restore a single item
router.post('/restore/:module/:id',            authenticate, permit(M, 'update'), a(c.restore))

// Permanently delete a single item
router.delete('/purge/:module/:id',            authenticate, permit(M, 'delete'), a(c.purge))

// Permanently delete ALL items (optionally filter by ?module=name)
router.delete('/purge-all',                    authenticate, permit(M, 'delete'), a(c.purgeAll))

export default router
