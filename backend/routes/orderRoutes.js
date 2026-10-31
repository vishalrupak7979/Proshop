import express from 'express'
import {
  createOrderFromStripe,
  getAllOrders,
  getMyOrders,
  getOrderById,
  markOrderDelivered,
} from '../controllers/orderController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Save an order once Stripe confirms payment
router.post('/stripe-success', protect, createOrderFromStripe)

// Admin: list all orders
router.route('/admin').get(protect, admin, getAllOrders)

// Logged in user's orders (must stay above /:id)
router.route('/mine').get(protect, getMyOrders)

router.route('/:id').get(protect, getOrderById)

// Admin: mark delivered
router.route('/:id/deliver').put(protect, admin, markOrderDelivered)

export default router
