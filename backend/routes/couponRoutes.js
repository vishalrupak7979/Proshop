import express from 'express'
import { applyCoupon, createCoupon, deleteCoupon, getCoupons, toggleCoupon } from '../controllers/couponController.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import { couponLimiter } from '../middleware/rateLimitMiddleware.js'

const router = express.Router()

router.post('/apply', protect, couponLimiter, applyCoupon)

router.route('/').get(protect, admin, getCoupons).post(protect, admin, createCoupon)
router.route('/:id').delete(protect, admin, deleteCoupon)
router.route('/:id/toggle').put(protect, admin, toggleCoupon)

export default router
