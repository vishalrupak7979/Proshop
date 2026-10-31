import mongoose from 'mongoose'
import Order from '../models/orderModel.js'
import Product from '../models/productModel.js'
import stripe from '../utils/stripe.js'

const DUPLICATE_KEY = 11000

// ------------------------------------------------------------------
// Create an order from a paid Stripe session. Everything is read from
// Stripe, so the browser can't change what was bought or what it cost.
// ------------------------------------------------------------------
export const createOrderFromStripe = async (req, res) => {
  try {
    const { sessionId } = req.body

    if (typeof sessionId !== 'string') {
      return res.status(400).json({ message: 'Stripe session missing' })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.client_reference_id !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Payment not found' })
    }
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment has not completed' })
    }

    // Refreshing the success page must not create a second order
    const existing = await Order.findOne({ stripeSessionId: sessionId })
    if (existing) {
      return res.json(existing)
    }

    const { data: lineItems } = await stripe.checkout.sessions.listLineItems(sessionId, {
      limit: 100,
      expand: ['data.price.product'],
    })

    const orderItems = lineItems.map((line) => ({
      name: line.description,
      qty: line.quantity,
      image: line.price.product.metadata.image,
      price: line.price.unit_amount / 100,
      product: line.price.product.metadata.productId,
    }))

    const address = session.shipping_details?.address || session.customer_details?.address

    let order
    try {
      order = await Order.create({
        user: req.user._id,
        orderItems,
        shippingAddress: {
          address: [address?.line1, address?.line2].filter(Boolean).join(', ') || 'Not provided',
          city: address?.city || 'Not provided',
          postalCode: address?.postal_code || 'Not provided',
          country: address?.country === 'IN' ? 'India' : address?.country || 'Not provided',
        },
        paymentMethod: 'Stripe',
        stripeSessionId: sessionId,
        itemsPrice: session.amount_subtotal / 100,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: session.amount_total / 100,
        isPaid: true,
        paidAt: Date.now(),
      })
    } catch (err) {
      // Two tabs can race here, and the unique index lets only one through
      if (err.code === DUPLICATE_KEY) {
        return res.json(await Order.findOne({ stripeSessionId: sessionId }))
      }
      throw err
    }

    // The customer has paid, so stock stops at zero rather than failing the order
    await Promise.all(orderItems.map((item) =>
      Product.updateOne({ _id: item.product }, [
        { $set: { countInStock: { $max: [0, { $subtract: ['$countInStock', item.qty] }] } } },
      ])
    ))

    res.status(201).json(order)
  } catch (err) {
    if (err.type === 'StripeInvalidRequestError') {
      return res.status(404).json({ message: 'Payment not found' })
    }
    console.error(`Order creation failed: ${err.message}`)
    res.status(500).json({ message: 'Could not save your order' })
  }
}


// ------------------------------------------------------------------
// Admin: Get all orders
// ------------------------------------------------------------------
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name email')

    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// ------------------------------------------------------------------
// Admin: Mark an order as delivered
// ------------------------------------------------------------------
export const markOrderDelivered = async (req, res) => {
  try {
    const order = mongoose.isValidObjectId(req.params.id)
      ? await Order.findById(req.params.id)
      : null

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    order.isDelivered = true
    order.deliveredAt = order.deliveredAt || Date.now()
    await order.save()

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// ------------------------------------------------------------------
// Get logged in user's orders
// ------------------------------------------------------------------
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// ------------------------------------------------------------------
// Get Order by ID (owner or admin only)
// ------------------------------------------------------------------
export const getOrderById = async (req, res) => {
  try {
    const order = mongoose.isValidObjectId(req.params.id)
      ? await Order.findById(req.params.id).populate('user', 'name email')
      : null

    const isOwner = order?.user?._id.equals(req.user._id)

    if (!order || !(isOwner || req.user.isAdmin)) {
      return res.status(404).json({ message: 'Order not found' })
    }

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
