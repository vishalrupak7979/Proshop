import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from './config/db.js'
import productDetails from './data/productDetails.js'
import Product from './models/productModel.js'

// Adds gallery, specifications and colours to products that have none yet.
// Anything an admin has already filled in is left alone.
await connectDB()

let updated = 0

for (const [name, details] of Object.entries(productDetails)) {
  const product = await Product.findOne({ name })
  if (!product) continue

  const changes = {}
  for (const key of ['images', 'specifications', 'colors']) {
    if (details[key] && product[key].length === 0) changes[key] = details[key]
  }

  if (Object.keys(changes).length > 0) {
    await Product.updateOne({ _id: product._id }, { $set: changes })
    updated += 1
  }
}

console.log(`Added details to ${updated} products`)
await mongoose.disconnect()
