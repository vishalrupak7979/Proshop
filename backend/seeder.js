import mongoose from 'mongoose'
import dotenv from 'dotenv'
import colors from 'colors'
import users from './data/users.js'
import products from './data/products.js'
import orders from './data/orders.js'
import User from './models/userModel.js'
import Product from './models/productModel.js'
import Order from './models/orderModel.js'
import connectDB from './config/db.js'

dotenv.config()
connectDB()

const DAY = 24 * 60 * 60 * 1000

const buildOrder = (order, createdUsers, createdProducts) => {
  const orderItems = order.items.map(([name, qty]) => {
    const product = createdProducts.find(p => p.name === name)
    return { name, qty, image: product.image, price: product.price, product: product._id }
  })
  const totalPrice = orderItems.reduce((acc, item) => acc + item.qty * item.price, 0)
  const createdAt = new Date(Date.now() - order.daysAgo * DAY)

  return {
    user: createdUsers.find(u => u.email === order.userEmail)._id,
    orderItems,
    shippingAddress: order.shippingAddress,
    paymentMethod: 'Stripe',
    itemsPrice: totalPrice,
    totalPrice,
    isPaid: order.isPaid,
    paidAt: order.isPaid ? createdAt : undefined,
    isDelivered: order.isDelivered,
    deliveredAt: order.isDelivered ? new Date(createdAt.getTime() + 2 * DAY) : undefined,
    createdAt,
  }
}

const importData = async () => {
  try {
    // Never wipe on import: this cluster may be serving the live site
    const existing = await User.countDocuments() + await Product.countDocuments() + await Order.countDocuments()
    if (existing > 0) {
      console.error('Database already has data. Run "npm run seed:destroy" first if you really want to replace it.'.red)
      process.exit(1)
    }

    const createdUsers = await User.insertMany(users)
    const adminUser = createdUsers[0]._id

    const sampleProducts = products.map(p => {
      const total = p.reviews.reduce((acc, r) => acc + r.rating, 0)
      return {
        ...p,
        user: adminUser,
        numReviews: p.reviews.length,
        rating: Math.round((total / p.reviews.length) * 10) / 10,
      }
    })

    const createdProducts = await Product.insertMany(sampleProducts)

    await Order.insertMany(orders.map(o => buildOrder(o, createdUsers, createdProducts)))

    console.log(`Data Imported! ${createdUsers.length} users, ${createdProducts.length} products, ${orders.length} orders`.green.inverse)
    process.exit()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

const destroyData = async () => {
  try {
    await Order.deleteMany()
    await Product.deleteMany()
    await User.deleteMany()

    console.log('Data Destroyed!'.red.inverse)
    process.exit()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

if (process.argv[2] === '-d') {
  destroyData()
} else {
  importData()
}
