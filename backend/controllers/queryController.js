import mongoose from 'mongoose'
import Order from '../models/orderModel.js'
import Product from '../models/productModel.js'
import Query, { QUERY_TOPICS } from '../models/queryModel.js'
import notify, { adminIds } from '../utils/notify.js'

const MAX_SUBJECT = 120
const MAX_MESSAGE = 2000

const clean = (value) => (typeof value === 'string' ? value.trim() : '')

const findQuery = async (id) => (mongoose.isValidObjectId(id) ? Query.findById(id) : null)

const canSee = (query, user) => query?.user.equals(user._id) || user.isAdmin

export const getTopics = (req, res) => res.json(QUERY_TOPICS)

export const createQuery = async (req, res) => {
  try {
    const subject = clean(req.body.subject)
    const message = clean(req.body.message)
    const { topic, orderId, productId } = req.body

    if (!subject || subject.length > MAX_SUBJECT) {
      return res.status(400).json({ message: `Enter a subject up to ${MAX_SUBJECT} characters` })
    }
    if (!message || message.length > MAX_MESSAGE) {
      return res.status(400).json({ message: `Enter a message up to ${MAX_MESSAGE} characters` })
    }
    if (!QUERY_TOPICS.includes(topic)) {
      return res.status(400).json({ message: 'Choose a topic' })
    }

    // A query can only point at the customer's own order
    let order
    if (orderId) {
      order = mongoose.isValidObjectId(orderId) ? await Order.findById(orderId) : null
      if (!order?.user.equals(req.user._id)) {
        return res.status(400).json({ message: 'That order was not found' })
      }
    }

    let product
    if (productId) {
      product = mongoose.isValidObjectId(productId) ? await Product.findById(productId) : null
      if (!product) {
        return res.status(400).json({ message: 'That product was not found' })
      }
    }

    const query = await Query.create({
      user: req.user._id,
      subject,
      topic,
      order: order?._id,
      product: product?._id,
      messages: [{ name: req.user.name, text: message }],
    })

    await notify(await adminIds(), {
      title: 'New customer query',
      message: `${req.user.name}: ${subject}`,
      link: `/queries/${query._id}`,
    })

    res.status(201).json(query)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getMyQueries = async (req, res) => {
  try {
    res.json(await Query.find({ user: req.user._id }).sort({ updatedAt: -1 }))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getAllQueries = async (req, res) => {
  try {
    res.json(await Query.find({}).sort({ updatedAt: -1 }).populate('user', 'name email'))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getQuery = async (req, res) => {
  try {
    const query = await findQuery(req.params.id)

    if (!query || !canSee(query, req.user)) {
      return res.status(404).json({ message: 'Query not found' })
    }

    res.json(await query.populate([
      { path: 'user', select: 'name email' },
      { path: 'product', select: 'name' },
    ]))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const addMessage = async (req, res) => {
  try {
    const query = await findQuery(req.params.id)

    if (!query || !canSee(query, req.user)) {
      return res.status(404).json({ message: 'Query not found' })
    }

    const text = clean(req.body.text)

    if (!text || text.length > MAX_MESSAGE) {
      return res.status(400).json({ message: `Enter a message up to ${MAX_MESSAGE} characters` })
    }
    if (query.status === 'Closed') {
      return res.status(400).json({ message: 'This query is closed. Please start a new one' })
    }

    const fromAdmin = !query.user.equals(req.user._id)

    query.messages.push({ fromAdmin, name: fromAdmin ? 'ProShop support' : req.user.name, text })
    query.status = fromAdmin ? 'Answered' : 'Open'
    await query.save()

    if (fromAdmin) {
      await notify(query.user, { title: 'Reply to your query', message: query.subject, link: `/queries/${query._id}` })
    } else {
      await notify(await adminIds(), { title: 'Customer replied', message: query.subject, link: `/queries/${query._id}` })
    }

    res.json(query)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const closeQuery = async (req, res) => {
  try {
    const query = await findQuery(req.params.id)

    if (!query || !canSee(query, req.user)) {
      return res.status(404).json({ message: 'Query not found' })
    }

    query.status = 'Closed'
    await query.save()

    res.json(query)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
