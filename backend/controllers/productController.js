import mongoose from 'mongoose'
import Product from '../models/productModel.js'

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({})
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getProductById = async (req, res) => {
  try {
    const product = mongoose.isValidObjectId(req.params.id)
      ? await Product.findById(req.params.id)
      : null

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
