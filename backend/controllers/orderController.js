import mongoose from 'mongoose'
import Order from '../models/orderModel.js'
import Product from '../models/productModel.js'
import User from '../models/userModel.js'
import stripe from '../utils/stripe.js'
import priceCart from '../utils/priceCart.js'
import { checkCoupon, recordCouponUse, redeemCoupon, releaseCoupon } from '../utils/coupons.js'
import notify, { adminIds } from '../utils/notify.js'

const DUPLICATE_KEY = 11000

// The next steps a delivery partner may take from each status
const PARTNER_STEPS = {
  Assigned: ['Picked up', 'Failed'],
  'Picked up': ['Out for delivery', 'Failed'],
  'Out for delivery': ['Delivered', 'Failed'],
}

const LOCATION_STATUSES = ['Picked up', 'Out for delivery']
const MAX_LOCATION_LABEL = 120

const setStatus = (order, status, note) => {
  order.status = status
  order.statusHistory.push({ status, note })
}

const markCashCollected = (order) => {
  const now = Date.now()
  order.codCollected = true
  order.codCollectedAt = now
  order.isPaid = true
  order.paidAt = now
}

const markDelivered = (order, note) => {
  setStatus(order, 'Delivered', note)
  order.isDelivered = true
  order.deliveredAt = order.deliveredAt || Date.now()
  // A partner's position is only shared while the delivery is under way
  order.currentLocation = undefined
}

const shortId = (order) => order._id.toString().slice(-8).toUpperCase()

const STATUS_MESSAGES = {
  'Picked up': 'has been picked up',
  'Out for delivery': 'is out for delivery',
  Delivered: 'has been delivered',
  Failed: 'could not be delivered',
  Cancelled: 'has been cancelled',
}

const notifyCustomer = (order, status) => notify(order.user._id || order.user, {
  title: `Order ${status.toLowerCase()}`,
  message: `Order #${shortId(order)} ${STATUS_MESSAGES[status]}`,
  link: `/order/${order._id}`,
})

const notifyOrderPlaced = async (order) => {
  await notify(order.user, {
    title: 'Order placed',
    message: `We've received order #${shortId(order)}`,
    link: `/order/${order._id}`,
  })
  await notify(await adminIds(), {
    title: 'New order',
    message: `Order #${shortId(order)} needs a delivery partner`,
    link: '/admin/orders',
  })
}

const restoreStock = (items) => Promise.all(items.map(({ product, qty }) =>
  Product.updateOne({ _id: product }, { $inc: { countInStock: qty } })
))

const findOrder = async (id) =>
  mongoose.isValidObjectId(id) ? Order.findById(id) : null

const validateAddress = (address) => {
  const value = (key) => (typeof address?.[key] === 'string' ? address[key].trim() : '')

  if (!value('address') || !value('city')) {
    return { error: 'Enter your full delivery address' }
  }
  if (!/^\d{6}$/.test(value('postalCode'))) {
    return { error: 'Enter a 6 digit PIN code' }
  }
  if (!/^[6-9]\d{9}$/.test(value('phone'))) {
    return { error: 'Enter a 10 digit mobile number' }
  }

  return {
    shippingAddress: {
      address: value('address'),
      city: value('city'),
      postalCode: value('postalCode'),
      phone: value('phone'),
      country: 'India',
    },
  }
}

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
      name: line.price.product.metadata.name || line.description,
      qty: line.quantity,
      image: line.price.product.metadata.image,
      color: line.price.product.metadata.color || undefined,
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
          phone: session.customer_details?.phone || undefined,
        },
        paymentMethod: 'Stripe',
        stripeSessionId: sessionId,
        itemsPrice: session.amount_subtotal / 100,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: session.amount_total / 100,
        couponCode: session.metadata?.couponCode || undefined,
        discountPrice: (session.total_details?.amount_discount || 0) / 100,
        isPaid: true,
        paidAt: Date.now(),
        status: 'Placed',
        statusHistory: [{ status: 'Placed' }],
      })
    } catch (err) {
      // Two tabs can race here, and the unique index lets only one through
      if (err.code === DUPLICATE_KEY) {
        return res.json(await Order.findOne({ stripeSessionId: sessionId }))
      }
      throw err
    }

    if (order.couponCode) {
      await recordCouponUse(order.couponCode, req.user._id)
    }

    await notifyOrderPlaced(order)

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
// Place a cash on delivery order
// ------------------------------------------------------------------
export const createCodOrder = async (req, res) => {
  const reserved = []
  let redeemed = null

  try {
    const { shippingAddress, error: addressError } = validateAddress(req.body.shippingAddress)
    if (addressError) {
      return res.status(400).json({ message: addressError })
    }

    const { items, error } = await priceCart(req.body.cartItems)
    if (error) {
      return res.status(400).json({ message: error })
    }

    // Nothing has been paid, so an order that can't get its stock is refused
    for (const { product, qty } of items) {
      const { modifiedCount } = await Product.updateOne(
        { _id: product._id, countInStock: { $gte: qty } },
        { $inc: { countInStock: -qty } }
      )

      if (modifiedCount === 0) {
        await restoreStock(reserved)
        return res.status(400).json({ message: `${product.name} just went out of stock` })
      }

      reserved.push({ product: product._id, qty })
    }

    const itemsPrice = Math.round(items.reduce((acc, { unitPrice, qty }) => acc + unitPrice * qty, 0) * 100) / 100

    const { couponCode } = req.body
    let discountPrice = 0

    if (couponCode) {
      const { coupon, discount, error: couponError } = await checkCoupon(couponCode, req.user._id, itemsPrice)

      if (couponError || !(await redeemCoupon(coupon, req.user._id))) {
        await restoreStock(reserved)
        return res.status(400).json({ message: couponError || 'That promo code has just run out' })
      }

      redeemed = coupon.code
      discountPrice = discount
    }

    const totalPrice = Math.round((itemsPrice - discountPrice) * 100) / 100

    const order = await Order.create({
      user: req.user._id,
      orderItems: items.map(({ product, qty, unitPrice, color, image }) => ({
        name: product.name,
        qty,
        image,
        color,
        price: unitPrice,
        product: product._id,
      })),
      shippingAddress,
      paymentMethod: 'COD',
      itemsPrice,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice,
      couponCode: redeemed || undefined,
      discountPrice,
      status: 'Placed',
      statusHistory: [{ status: 'Placed' }],
    })

    await notifyOrderPlaced(order)

    res.status(201).json(order)
  } catch (err) {
    await restoreStock(reserved).catch(() => {})
    if (redeemed) {
      await releaseCoupon(redeemed, req.user._id).catch(() => {})
    }
    console.error(`COD order failed: ${err.message}`)
    res.status(500).json({ message: 'Could not place your order, please try again' })
  }
}


// ------------------------------------------------------------------
// Admin: Assign a delivery partner
// ------------------------------------------------------------------
export const assignDeliveryPartner = async (req, res) => {
  try {
    const order = await findOrder(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    if (!['Placed', 'Assigned', 'Failed'].includes(order.status)) {
      return res.status(400).json({ message: `An order that is ${order.status.toLowerCase()} can't be reassigned` })
    }

    const { partnerId } = req.body
    const partner = mongoose.isValidObjectId(partnerId) ? await User.findById(partnerId) : null

    if (!partner?.isDeliveryPartner) {
      return res.status(400).json({ message: 'Choose a delivery partner' })
    }

    order.deliveryPartner = partner._id
    setStatus(order, 'Assigned', `Assigned to ${partner.name}`)
    await order.save()

    await notify(partner._id, {
      title: 'New delivery',
      message: `Order #${shortId(order)} for ${order.shippingAddress.city} is assigned to you`,
      link: '/delivery',
    })
    await notify(order.user, {
      title: 'Delivery partner assigned',
      message: `${partner.name} will deliver order #${shortId(order)}`,
      link: `/order/${order._id}`,
    })

    res.json(await order.populate('deliveryPartner', 'name phone'))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// ------------------------------------------------------------------
// Admin: Cancel an unpaid order and put its stock back
// ------------------------------------------------------------------
export const cancelOrder = async (req, res) => {
  try {
    const order = await findOrder(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    if (order.isPaid || ['Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({ message: 'This order can no longer be cancelled' })
    }

    setStatus(order, 'Cancelled')
    order.currentLocation = undefined
    await order.save()
    await restoreStock(order.orderItems)
    if (order.couponCode) {
      await releaseCoupon(order.couponCode, order.user)
    }
    await notifyCustomer(order, 'Cancelled')
    await notify(order.deliveryPartner, {
      title: 'Delivery cancelled',
      message: `Order #${shortId(order)} was cancelled`,
      link: '/delivery',
    })

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// ------------------------------------------------------------------
// Delivery partner: Assigned orders, open ones first
// ------------------------------------------------------------------
export const getMyDeliveries = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryPartner: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name')
      .select('-stripeSessionId')

    const isOpen = (order) => Boolean(PARTNER_STEPS[order.status])
    res.json([...orders.filter(isOpen), ...orders.filter((order) => !isOpen(order))])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// ------------------------------------------------------------------
// Delivery partner: Move an order to its next step
// ------------------------------------------------------------------
export const updateDeliveryStatus = async (req, res) => {
  try {
    const order = await findOrder(req.params.id)

    if (!order || !order.deliveryPartner?.equals(req.user._id)) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const { status, cashCollected } = req.body
    const note = typeof req.body.note === 'string' ? req.body.note.trim().slice(0, MAX_LOCATION_LABEL) : ''

    if (!PARTNER_STEPS[order.status]?.includes(status)) {
      return res.status(400).json({ message: `An order that is ${order.status.toLowerCase()} can't be marked ${String(status).toLowerCase()}` })
    }

    if (status === 'Failed') {
      if (!note) {
        return res.status(400).json({ message: 'Say why the delivery failed' })
      }
      setStatus(order, 'Failed', note)
      order.currentLocation = undefined
    } else if (status === 'Delivered') {
      if (order.paymentMethod === 'COD' && !order.isPaid) {
        if (cashCollected !== true) {
          return res.status(400).json({ message: 'Confirm the cash was collected first' })
        }
        markCashCollected(order)
      }
      markDelivered(order, note || undefined)
    } else {
      setStatus(order, status, note || undefined)
    }

    await order.save()
    await notifyCustomer(order, status)

    if (status === 'Failed') {
      await notify(await adminIds(), {
        title: 'Delivery failed',
        message: `Order #${shortId(order)}: ${note}`,
        link: '/admin/orders',
      })
    }
    res.json(await order.populate('user', 'name'))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// ------------------------------------------------------------------
// Delivery partner: Share where the order is
// ------------------------------------------------------------------
export const updateDeliveryLocation = async (req, res) => {
  try {
    const order = await findOrder(req.params.id)

    if (!order || !order.deliveryPartner?.equals(req.user._id)) {
      return res.status(404).json({ message: 'Order not found' })
    }
    if (!LOCATION_STATUSES.includes(order.status)) {
      return res.status(400).json({ message: 'Location can be shared once the order is picked up' })
    }

    const { lat, lng } = req.body
    const label = typeof req.body.label === 'string' ? req.body.label.trim() : ''
    const hasCoordinates = lat !== undefined || lng !== undefined

    if (hasCoordinates && !(Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lng) && Math.abs(lng) <= 180)) {
      return res.status(400).json({ message: 'That location is not valid' })
    }
    if (!hasCoordinates && !label) {
      return res.status(400).json({ message: 'Share your location or type where you are' })
    }
    if (label.length > MAX_LOCATION_LABEL) {
      return res.status(400).json({ message: 'Keep the location under 120 characters' })
    }

    order.currentLocation = {
      lat: hasCoordinates ? lat : undefined,
      lng: hasCoordinates ? lng : undefined,
      label: label || undefined,
      updatedAt: Date.now(),
    }
    await order.save()

    res.json(await order.populate('user', 'name'))
  } catch (err) {
    res.status(500).json({ message: err.message })
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
      .populate('deliveryPartner', 'name phone')

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

    if (order.status === 'Cancelled') {
      return res.status(400).json({ message: 'This order was cancelled' })
    }

    // Admins confirm a delivery themselves, which includes the cash for COD
    if (order.paymentMethod === 'COD' && !order.isPaid) {
      markCashCollected(order)
    }
    markDelivered(order)
    await order.save()
    await notifyCustomer(order, 'Delivered')

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
      ? await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('deliveryPartner', 'name phone')
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
