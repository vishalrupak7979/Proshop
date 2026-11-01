// Must stay first: other imports read these settings as they load
import 'dotenv/config'
import express from 'express'
import colors from 'colors'
import cors from 'cors'
import helmet from 'helmet'
import connectDB from './config/db.js'
import productRoutes from './routes/productRoutes.js'
import userRoutes from './routes/userRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

import { errorHandler, notFound } from './middleware/errorMiddleware.js'
import paymentRoutes from "./routes/paymentRoutes.js";
import uploadRoutes from './routes/uploadRoutes.js'
import offerRoutes from './routes/offerRoutes.js'
import adRoutes from './routes/adRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import couponRoutes from './routes/couponRoutes.js'
import path from 'path'
const __dirname = path.resolve()
// Connect DB
connectDB()

// Initialize app
const app = express()

// Render sits in front of the app, so rate limits need the real client IP
app.set('trust proxy', 1)

// Product images are loaded from the frontend's domain
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

// Parse JSON body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.get('/', (req, res) => {
  res.send('API is running...')
})

app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use("/api/payment", paymentRoutes);
app.use('/api/images', uploadRoutes)
app.use('/api/offers', offerRoutes)
app.use('/api/ads', adRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/images', express.static(path.join(__dirname, '/images')))

// Error Handling Middlewares
app.use(notFound)
app.use(errorHandler)

// Run server
const PORT = process.env.PORT || 5000
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`.cyan.bold)
)
