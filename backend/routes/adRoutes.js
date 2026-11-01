import express from 'express'
import { getLiveAds, getAllAds, createAd, updateAd, deleteAd } from '../controllers/adController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/').get(getLiveAds).post(protect, admin, createAd)

// Must stay above /:id
router.get('/all', protect, admin, getAllAds)

router.route('/:id').put(protect, admin, updateAd).delete(protect, admin, deleteAd)

export default router
