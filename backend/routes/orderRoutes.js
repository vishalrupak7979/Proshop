import express from 'express'
import {
  assignDeliveryPartner,
  cancelOrder,
  createCodOrder,
  createOrderFromStripe,
  getAllOrders,
  getMyDeliveries,
  getMyOrders,
  getOrderById,
  markOrderDelivered,
  updateDeliveryLocation,
  updateDeliveryStatus,
} from '../controllers/orderController.js'
import { protect, admin, deliveryPartner } from '../middleware/authMiddleware.js'

const router = express.Router()

// Save an order once Stripe confirms payment
router.post('/stripe-success', protect, createOrderFromStripe)

// Place a cash on delivery order
router.post('/cod', protect, createCodOrder)

// Admin: list all orders
router.route('/admin').get(protect, admin, getAllOrders)

// Logged in user's orders (must stay above /:id)
router.route('/mine').get(protect, getMyOrders)

// Delivery partner: assigned orders (must stay above /:id)
router.route('/deliveries').get(protect, deliveryPartner, getMyDeliveries)

router.route('/:id').get(protect, getOrderById)

// Admin: assign, cancel, mark delivered
router.route('/:id/assign').put(protect, admin, assignDeliveryPartner)
router.route('/:id/cancel').put(protect, admin, cancelOrder)
router.route('/:id/deliver').put(protect, admin, markOrderDelivered)

// Delivery partner: progress and location
router.route('/:id/delivery-status').put(protect, deliveryPartner, updateDeliveryStatus)
router.route('/:id/location').put(protect, deliveryPartner, updateDeliveryLocation)

export default router
