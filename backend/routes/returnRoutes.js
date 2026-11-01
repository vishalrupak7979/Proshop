import express from 'express'
import {
  approveReturn,
  createReturn,
  getAllReturns,
  getMyReturns,
  getOrderReturns,
  receiveReturn,
  refundReturn,
  rejectReturn,
} from '../controllers/returnController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/').get(protect, admin, getAllReturns).post(protect, createReturn)
router.get('/mine', protect, getMyReturns)
router.get('/order/:orderId', protect, getOrderReturns)

router.put('/:id/approve', protect, admin, approveReturn)
router.put('/:id/reject', protect, admin, rejectReturn)
router.put('/:id/receive', protect, admin, receiveReturn)
router.put('/:id/refund', protect, admin, refundReturn)

export default router
