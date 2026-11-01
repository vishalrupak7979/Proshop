import mongoose from 'mongoose'
import Product from '../models/productModel.js'
import { getLiveOffers, withOffer } from '../utils/offers.js'

const MAX_PRICE = 10000000

const readProduct = (body) => {
  const text = (key) => (typeof body[key] === 'string' ? body[key].trim() : '')
  const price = Number(body.price)
  const countInStock = Number(body.countInStock)

  if (!text('name') || !text('brand') || !text('category') || !text('description')) {
    return { error: 'Name, brand, category and description are required' }
  }
  if (!text('image')) {
    return { error: 'Add a product image' }
  }
  if (!Number.isFinite(price) || price <= 0 || price > MAX_PRICE) {
    return { error: 'Enter a valid price' }
  }
  if (!Number.isInteger(countInStock) || countInStock < 0) {
    return { error: 'Quantity must be 0 or more' }
  }

  return {
    fields: {
      name: text('name'),
      brand: text('brand'),
      category: text('category'),
      description: text('description'),
      image: text('image'),
      price,
      countInStock,
    },
  }
}

const findProduct = async (id) =>
  mongoose.isValidObjectId(id) ? Product.findById(id) : null

export const getProducts = async (req, res) => {
  try {
    const [products, offers] = await Promise.all([Product.find({}).sort({ createdAt: 1 }), getLiveOffers()])
    res.json(products.map((product) => withOffer(product, offers)))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getProductById = async (req, res) => {
  try {
    const product = await findProduct(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json(withOffer(product, await getLiveOffers()))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ADMIN: Full prices, before any offer
export const getProductsForAdmin = async (req, res) => {
  try {
    res.json(await Product.find({}).sort({ createdAt: -1 }).select('-reviews'))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const createProduct = async (req, res) => {
  try {
    const { fields, error } = readProduct(req.body)

    if (error) {
      return res.status(400).json({ message: error })
    }

    res.status(201).json(await Product.create({ ...fields, user: req.user._id }))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const product = await findProduct(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const { fields, error } = readProduct(req.body)

    if (error) {
      return res.status(400).json({ message: error })
    }

    product.set(fields)
    await product.save()

    res.json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Past orders keep their own name and price, and still show the product's image
export const deleteProduct = async (req, res) => {
  try {
    const product = await findProduct(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    await product.deleteOne()
    res.json({ message: 'Product deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
