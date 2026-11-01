import express from 'express'
import {
  authUser,
  registerUser,
  forgotPassword,
  resetPassword,
  getDeliveryPartners,
  createDeliveryPartner,
} from '../controllers/userController.js'
import { authLimiter } from '../middleware/rateLimitMiddleware.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/login', authLimiter, authUser)
router.post('/', authLimiter, registerUser)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password/:token', authLimiter, resetPassword)

// Partners are created by an admin, never through public signup
router.route('/delivery-partners')
  .get(protect, admin, getDeliveryPartners)
  .post(protect, admin, createDeliveryPartner)

export default router
