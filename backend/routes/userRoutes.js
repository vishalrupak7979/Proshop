import express from 'express'
import { authUser, registerUser, forgotPassword, resetPassword } from '../controllers/userController.js'

const router = express.Router()

router.post('/login', authUser)
router.post('/', registerUser)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

export default router
