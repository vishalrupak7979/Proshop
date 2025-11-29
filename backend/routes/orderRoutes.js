// import express from 'express'
// import { addOrderItems } from '../controllers/orderController.js'
// import { protect } from '../middleware/authMiddleware.js'

// const router = express.Router()

// router.post('/', protect, addOrderItems)

// export default router


import express from 'express'
import {
  addOrderItems,
  getAllOrders,
  getOrderById,
  createOrderFromStripe
} from '../controllers/orderController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Create order
router.route('/').post(protect, addOrderItems)

// Admin – list all orders
router.route('/admin').get(protect, admin, getAllOrders)

// Get single order
router.route('/:id').get(protect, getOrderById)


// When Stripe payment succeeds
router.post('/stripe-success', protect, createOrderFromStripe)
export default router
