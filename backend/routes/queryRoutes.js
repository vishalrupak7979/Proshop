import express from 'express'
import {
  addMessage,
  closeQuery,
  createQuery,
  getAllQueries,
  getMyQueries,
  getQuery,
  getTopics,
} from '../controllers/queryController.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import { queryLimiter } from '../middleware/rateLimitMiddleware.js'

const router = express.Router()

router.route('/').get(protect, admin, getAllQueries).post(protect, queryLimiter, createQuery)
router.get('/mine', protect, getMyQueries)
router.get('/topics', protect, getTopics)

router.route('/:id').get(protect, getQuery)
router.post('/:id/messages', protect, queryLimiter, addMessage)
router.put('/:id/close', protect, closeQuery)

export default router
