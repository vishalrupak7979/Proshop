import mongoose from 'mongoose'
import Product from '../models/productModel.js'
import { getLiveOffers, withOffer } from './offers.js'

// Prices and stock come from the database, never from the browser.
// Returns { items } on success, or { error } with a message for the customer.
const priceCart = async (cartItems) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { error: 'Your cart is empty' }
  }

  const ids = cartItems.map((item) => item._id).filter((id) => mongoose.isValidObjectId(id))
  const [products, offers] = await Promise.all([Product.find({ _id: { $in: ids } }), getLiveOffers()])

  const items = []

  for (const item of cartItems) {
    const product = products.find((p) => p._id.equals(item._id))

    if (!product) {
      return { error: 'An item in your cart is no longer available' }
    }

    // Colours share one stock count, so add up every line for this product
    const wanted = cartItems
      .filter((line) => line._id === item._id)
      .reduce((acc, line) => acc + line.qty, 0)

    if (!Number.isInteger(item.qty) || item.qty < 1 || wanted > product.countInStock) {
      return { error: `Only ${product.countInStock} of ${product.name} left in stock` }
    }

    const color = item.color
      ? product.colors.find((c) => c.name === item.color)
      : product.colors[0]

    if (item.color && !color) {
      return { error: `That colour of ${product.name} is no longer available` }
    }

    items.push({
      product,
      qty: item.qty,
      unitPrice: withOffer(product, offers).price,
      color: color?.name,
      image: color?.image || product.image,
    })
  }

  return { items }
}

export default priceCart
