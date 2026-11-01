import mongoose from 'mongoose'
import Order from '../models/orderModel.js'
import Product from '../models/productModel.js'
import Return, { RETURN_REASONS } from '../models/returnModel.js'
import notify, { adminIds } from '../utils/notify.js'
import stripe from '../utils/stripe.js'

export const RETURN_WINDOW_DAYS = 7

const DAY = 24 * 60 * 60 * 1000
const DUPLICATE_KEY = 11000
const MAX_NOTE = 500

const shortId = (doc) => doc._id.toString().slice(-8).toUpperCase()
const rupees = (value) => Math.round(value * 100) / 100
const lineKey = (item) => `${item.product}:${item.color || ''}`

const windowEnds = (order) => new Date(order.deliveredAt.getTime() + RETURN_WINDOW_DAYS * DAY)

// Promo discounts come off proportionally, so a refund matches what was paid
const refundFor = (items, order) => {
  const goods = items.reduce((acc, item) => acc + item.price * item.qty, 0)
  const paidShare = order.itemsPrice > 0 ? order.totalPrice / order.itemsPrice : 1
  const remaining = order.totalPrice - order.refundedAmount
  return rupees(Math.max(0, Math.min(goods * paidShare, remaining)))
}

// How many of each order line are still free to return
const returnableItems = async (order) => {
  const earlier = await Return.find({ order: order._id, status: { $ne: 'Rejected' } })
  const used = {}

  earlier.flatMap((ret) => ret.items).forEach((item) => {
    used[lineKey(item)] = (used[lineKey(item)] || 0) + item.qty
  })

  return order.orderItems
    .map((item) => ({ item, available: item.qty - (used[lineKey(item)] || 0) }))
    .filter(({ available }) => available > 0)
}

const ownOrder = async (id, user) => {
  const order = mongoose.isValidObjectId(id) ? await Order.findById(id) : null
  return order?.user.equals(user._id) ? order : null
}

// What the order page needs to offer a return
export const getOrderReturns = async (req, res) => {
  try {
    const order = await ownOrder(req.params.orderId, req.user)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const returns = await Return.find({ order: order._id }).sort({ createdAt: -1 })
    const inWindow = order.isDelivered && order.deliveredAt && windowEnds(order) >= new Date()
    const hasOpen = returns.some((ret) => ret.isOpen)
    const available = inWindow && !hasOpen ? await returnableItems(order) : []

    res.json({
      returns,
      reasons: RETURN_REASONS,
      windowEndsAt: order.deliveredAt ? windowEnds(order) : null,
      returnable: available.map(({ item, available: qty }) => ({
        product: item.product,
        name: item.name,
        image: item.image,
        color: item.color,
        price: item.price,
        qty,
      })),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const createReturn = async (req, res) => {
  try {
    const { orderId, items, reason } = req.body
    const note = typeof req.body.note === 'string' ? req.body.note.trim().slice(0, MAX_NOTE) : ''

    const order = await ownOrder(orderId, req.user)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    if (!order.isDelivered || !order.deliveredAt) {
      return res.status(400).json({ message: 'Items can be returned once the order is delivered' })
    }
    if (windowEnds(order) < new Date()) {
      return res.status(400).json({ message: `Returns are open for ${RETURN_WINDOW_DAYS} days after delivery` })
    }
    if (!RETURN_REASONS.includes(reason)) {
      return res.status(400).json({ message: 'Choose a reason for the return' })
    }
    if (reason === 'Other' && !note) {
      return res.status(400).json({ message: 'Tell us why you are returning this' })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Choose at least one item to return' })
    }

    const available = await returnableItems(order)
    const chosen = []

    for (const request of items) {
      const line = available.find(({ item }) => lineKey(item) === lineKey(request))

      if (!line || !Number.isInteger(request.qty) || request.qty < 1 || request.qty > line.available) {
        return res.status(400).json({ message: 'One of those items can no longer be returned' })
      }

      const { product, name, image, color, price } = line.item
      chosen.push({ product, name, image, color, price, qty: request.qty })
    }

    if (new Set(chosen.map(lineKey)).size !== chosen.length) {
      return res.status(400).json({ message: 'Each item can only be listed once' })
    }

    const ret = await Return.create({
      order: order._id,
      user: req.user._id,
      items: chosen,
      reason,
      note: note || undefined,
      refundAmount: refundFor(chosen, order),
      history: [{ status: 'Requested' }],
    })

    await notify(await adminIds(), {
      title: 'New return request',
      message: `Return for order #${shortId(order)}: ${reason}`,
      link: '/admin/returns',
    })

    res.status(201).json(ret)
  } catch (err) {
    if (err.code === DUPLICATE_KEY) {
      return res.status(400).json({ message: 'This order already has an open return' })
    }
    res.status(500).json({ message: err.message })
  }
}

export const getMyReturns = async (req, res) => {
  try {
    res.json(await Return.find({ user: req.user._id }).sort({ createdAt: -1 }))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getAllReturns = async (req, res) => {
  try {
    res.json(await Return.find({}).sort({ createdAt: -1 }).populate('user', 'name email'))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Only moves from an expected status, so a repeated click can't apply twice
const moveReturn = (id, from, changes, note) => {
  const { status } = changes
  return Return.findOneAndUpdate(
    { _id: id, status: from },
    { $set: changes, $push: { history: { status, note, at: new Date() } } },
    { new: true }
  )
}

const stepFailed = async (res, id) => {
  const exists = mongoose.isValidObjectId(id) && (await Return.exists({ _id: id }))
  return exists
    ? res.status(400).json({ message: 'This return has already moved on' })
    : res.status(404).json({ message: 'Return not found' })
}

const validId = (id) => mongoose.isValidObjectId(id)

const tellCustomer = (ret, title, message) =>
  notify(ret.user, { title, message, link: '/returns' })

export const approveReturn = async (req, res) => {
  try {
    const ret = validId(req.params.id) ? await moveReturn(req.params.id, 'Requested', { status: 'Approved' }) : null
    if (!ret) return stepFailed(res, req.params.id)

    await tellCustomer(ret, 'Return approved', `Your return #${shortId(ret)} was approved. Please keep the items ready`)
    res.json(ret)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const rejectReturn = async (req, res) => {
  try {
    const note = typeof req.body.note === 'string' ? req.body.note.trim().slice(0, MAX_NOTE) : ''

    if (!note) {
      return res.status(400).json({ message: 'Give the customer a reason' })
    }

    const ret = validId(req.params.id)
      ? await moveReturn(req.params.id, { $in: ['Requested', 'Approved'] }, { status: 'Rejected', isOpen: false }, note)
      : null
    if (!ret) return stepFailed(res, req.params.id)

    await tellCustomer(ret, 'Return declined', `Return #${shortId(ret)}: ${note}`)
    res.json(ret)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const receiveReturn = async (req, res) => {
  try {
    const restock = req.body.restock === true
    const ret = validId(req.params.id)
      ? await moveReturn(req.params.id, 'Approved', { status: 'Received', restocked: restock })
      : null
    if (!ret) return stepFailed(res, req.params.id)

    if (restock) {
      await Promise.all(ret.items.map((item) =>
        Product.updateOne({ _id: item.product }, { $inc: { countInStock: item.qty } })
      ))
    }

    await tellCustomer(ret, 'Return received', `We have your return #${shortId(ret)}. Your refund is next`)
    res.json(ret)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const refundReturn = async (req, res) => {
  try {
    const current = validId(req.params.id) ? await Return.findOne({ _id: req.params.id, status: 'Received' }) : null
    if (!current) return stepFailed(res, req.params.id)

    const order = await Order.findById(current.order)
    const amount = refundFor(current.items, order)
    const changes = { status: 'Refunded', isOpen: false, refundAmount: amount, refundMethod: 'Manual' }

    if (order.paymentMethod === 'Stripe' && order.stripeSessionId && amount > 0) {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId)

      // The key stops a double click or retry from refunding twice
      const refund = await stripe.refunds.create(
        { payment_intent: session.payment_intent, amount: Math.round(amount * 100) },
        { idempotencyKey: `return-${current._id}` }
      )

      changes.refundMethod = 'Stripe'
      changes.stripeRefundId = refund.id
    }

    const ret = await moveReturn(current._id, 'Received', changes)
    if (!ret) return stepFailed(res, req.params.id)

    await Order.updateOne({ _id: order._id }, { $inc: { refundedAmount: amount } })
    await tellCustomer(ret, 'Refund issued', `₹${amount.toLocaleString('en-IN')} refunded for return #${shortId(ret)}`)

    res.json(ret)
  } catch (err) {
    console.error(`Refund failed: ${err.message}`)
    res.status(500).json({ message: 'The refund could not be completed. Nothing has changed, please try again' })
  }
}
