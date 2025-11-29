import express from 'express'
import dotenv from 'dotenv'
import colors from 'colors'
import cors from 'cors'
import connectDB from './config/db.js'
import productRoutes from './routes/productRoutes.js'
import userRoutes from './routes/userRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

import { errorHandler, notFound } from './middleware/errorMiddleware.js'
import paymentRoutes from "./routes/paymentRoutes.js";
import path from 'path'
const __dirname = path.resolve()
// Load env
dotenv.config()

// Connect DB
connectDB()

// Initialize app
const app = express()

// Enable CORS
app.use(cors({
  origin: '*',     // or "http://localhost:5173"
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
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
app.use('/images', express.static(path.join(__dirname, '/images')))

// Error Handling Middlewares
app.use(notFound)
app.use(errorHandler)

// Run server
const PORT = process.env.PORT || 5000
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`.cyan.bold)
)
