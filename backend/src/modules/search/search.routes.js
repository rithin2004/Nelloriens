import { Router } from 'express'
import { authenticate as auth } from '../../middlewares/auth.js'
import { permit }               from '../../middlewares/permissions.js'
import { search }               from './search.controller.js'

const router = new Router()
router.get('/', auth, permit('search','read'), search)

export default router
