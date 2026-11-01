import express from 'express'
import { uploadImage, getImage } from '../controllers/uploadController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

const rawImage = express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '3mb' })

router.post('/', protect, admin, rawImage, uploadImage)
router.get('/:id', getImage)

export default router
