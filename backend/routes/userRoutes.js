import express from 'express'
import { authUser, registerUser, forgotPassword, resetPassword } from '../controllers/userController.js'
import { authLimiter } from '../middleware/rateLimitMiddleware.js'

const router = express.Router()

router.post('/login', authLimiter, authUser)
router.post('/', authLimiter, registerUser)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password/:token', authLimiter, resetPassword)

export default router
