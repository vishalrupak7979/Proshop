import mongoose from 'mongoose'
import Product from '../models/productModel.js'
import { getLiveOffers, withOffer } from '../utils/offers.js'

const MAX_PRICE = 10000000
const MAX_GALLERY = 8
const MAX_SPECIFICATIONS = 30
const MAX_COLORS = 12
const HEX_COLOR = /^#[0-9a-f]{6}$/i
const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 48

const SORTERS = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
  discount: (a, b) => (b.discountPercent || 0) - (a.discountPercent || 0),
}

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const positiveInt = (value, fallback) => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : fallback
}

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

  const images = Array.isArray(body.images)
    ? body.images.filter((image) => typeof image === 'string' && image.trim()).slice(0, MAX_GALLERY)
    : []

  const specifications = Array.isArray(body.specifications)
    ? body.specifications
      .filter((spec) => typeof spec?.label === 'string' && typeof spec?.value === 'string')
      .map((spec) => ({ label: spec.label.trim(), value: spec.value.trim() }))
      .filter((spec) => spec.label && spec.value)
      .slice(0, MAX_SPECIFICATIONS)
    : []

  const colorList = Array.isArray(body.colors) ? body.colors : []
  if (colorList.length > MAX_COLORS) {
    return { error: `Add up to ${MAX_COLORS} colours` }
  }
  if (colorList.some((color) => typeof color?.name !== 'string' || !color.name.trim() || !HEX_COLOR.test(color?.hex))) {
    return { error: 'Each colour needs a name and a valid colour' }
  }

  const colors = colorList.map((color) => ({
    name: color.name.trim(),
    hex: color.hex,
    image: typeof color.image === 'string' && color.image ? color.image : undefined,
  }))

  if (new Set(colors.map((color) => color.name.toLowerCase())).size !== colors.length) {
    return { error: 'Each colour needs a different name' }
  }

  return {
    fields: {
      images,
      specifications,
      colors,
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

// One page of the shop, or just the given ids for the cart
export const getProducts = async (req, res) => {
  try {
    const { ids, search, category, sort } = req.query
    const offers = await getLiveOffers()

    if (typeof ids === 'string') {
      const valid = ids.split(',').filter((id) => mongoose.isValidObjectId(id))
      const products = await Product.find({ _id: { $in: valid } }).select('-reviews')
      return res.json(products.map((product) => withOffer(product, offers)))
    }

    if (req.query.page === undefined) {
      const products = await Product.find({}).sort({ createdAt: 1, _id: 1 }).select('-reviews')
      return res.json(products.map((product) => withOffer(product, offers)))
    }

    const filter = {}
    if (typeof category === 'string' && category) {
      filter.category = category
    }
    if (typeof search === 'string' && search.trim()) {
      const term = new RegExp(escapeRegex(search.trim()), 'i')
      filter.$or = [{ name: term }, { brand: term }]
    }

    const limit = Math.min(positiveInt(req.query.limit, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE)
    const [matches, categories] = await Promise.all([
      Product.find(filter).sort({ createdAt: 1, _id: 1 }).select('-reviews'),
      Product.distinct('category'),
    ])

    // Sorted after offers are applied, so price order matches what customers see
    const priced = matches.map((product) => withOffer(product, offers))
    if (SORTERS[sort]) {
      priced.sort(SORTERS[sort])
    }

    const pages = Math.max(1, Math.ceil(priced.length / limit))
    const page = Math.min(positiveInt(req.query.page, 1), pages)

    res.json({
      products: priced.slice((page - 1) * limit, page * limit),
      page,
      pages,
      total: priced.length,
      limit,
      categories: categories.sort(),
    })
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
