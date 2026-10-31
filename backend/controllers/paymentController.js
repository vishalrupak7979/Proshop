import mongoose from 'mongoose'
import Product from '../models/productModel.js'
import stripe from '../utils/stripe.js'

export const createCheckoutSession = async (req, res) => {
  try {
    const { cartItems } = req.body

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' })
    }

    // Prices and stock come from the database, never from the browser
    const ids = cartItems.map((item) => item._id).filter((id) => mongoose.isValidObjectId(id))
    const products = await Product.find({ _id: { $in: ids } })

    const line_items = []

    for (const item of cartItems) {
      const product = products.find((p) => p._id.equals(item._id))

      if (!product) {
        return res.status(400).json({ message: 'An item in your cart is no longer available' })
      }
      if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > product.countInStock) {
        return res.status(400).json({ message: `Only ${product.countInStock} of ${product.name} left in stock` })
      }

      line_items.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: product.name,
            metadata: { productId: product._id.toString(), image: product.image },
          },
          unit_amount: Math.round(product.price * 100), // amount in paise
        },
        quantity: item.qty,
      })
    }

    const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, '')

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      client_reference_id: req.user._id.toString(),
      customer_email: req.user.email,
      shipping_address_collection: { allowed_countries: ['IN'] },
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/cart`,
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error(`Checkout failed: ${err.message}`)
    res.status(500).json({ message: 'Could not start checkout, please try again' })
  }
}
