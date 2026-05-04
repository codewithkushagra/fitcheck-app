import { Router } from 'express'
import { registerGym, login, registerClient, me } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/register-gym', registerGym)
router.post('/register-client', registerClient)
router.post('/login', login)
router.get('/me', authenticate, me)

export default router
