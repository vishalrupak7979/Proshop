import express from 'express'
import { getNotifications, markAllRead, markRead, broadcast } from '../controllers/notificationController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', protect, getNotifications)
router.put('/read-all', protect, markAllRead)
router.post('/broadcast', protect, admin, broadcast)
router.put('/:id/read', protect, markRead)

export default router
