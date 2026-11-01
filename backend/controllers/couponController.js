import mongoose from 'mongoose'
import Coupon from '../models/couponModel.js'
import notify, { audienceIds } from '../utils/notify.js'
import { checkCoupon, normalizeCode } from '../utils/coupons.js'
import priceCart from '../utils/priceCart.js'

const CODE_FORMAT = /^[A-Z0-9-]{3,20}$/

const optionalNumber = (value) => (value === '' || value === null || value === undefined ? undefined : Number(value))

const readCoupon = (body) => {
  const code = normalizeCode(body.code)
  const discountPercent = Number(body.discountPercent)
  const maxDiscount = optionalNumber(body.maxDiscount)
  const minOrder = optionalNumber(body.minOrder) ?? 0
  const usageLimit = optionalNumber(body.usageLimit)
  const startsAt = new Date(body.startsAt)
  const endsAt = new Date(body.endsAt)

  if (!CODE_FORMAT.test(code)) {
    return { error: 'Codes use 3 to 20 letters, numbers or dashes' }
  }
  if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 90) {
    return { error: 'Discount must be between 1 and 90 percent' }
  }
  if (maxDiscount !== undefined && !(maxDiscount > 0)) {
    return { error: 'The maximum discount must be more than 0' }
  }
  if (!(minOrder >= 0)) {
    return { error: 'The minimum order must be 0 or more' }
  }
  if (usageLimit !== undefined && !(Number.isInteger(usageLimit) && usageLimit > 0)) {
    return { error: 'The usage limit must be a whole number' }
  }
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
    return { error: 'The code must end after it starts' }
  }

  return {
    fields: { code, discountPercent, maxDiscount, minOrder, usageLimit, startsAt, endsAt, isActive: body.isActive !== false },
  }
}

export const getCoupons = async (req, res) => {
  try {
    res.json(await Coupon.find({}).select('-usedBy').sort({ createdAt: -1 }))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const createCoupon = async (req, res) => {
  try {
    const { fields, error } = readCoupon(req.body)

    if (error) {
      return res.status(400).json({ message: error })
    }
    if (await Coupon.findOne({ code: fields.code })) {
      return res.status(400).json({ message: 'That code already exists' })
    }

    const coupon = await Coupon.create(fields)

    if (req.body.notifyCustomers === true) {
      await notify(await audienceIds('customers'), {
        title: `${coupon.discountPercent}% off with ${coupon.code}`,
        message: `Use code ${coupon.code} at checkout, ending ${coupon.endsAt.toLocaleDateString('en-IN')}`,
        link: '/',
      })
    }

    res.status(201).json(coupon)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const toggleCoupon = async (req, res) => {
  try {
    const coupon = mongoose.isValidObjectId(req.params.id) ? await Coupon.findById(req.params.id) : null

    if (!coupon) {
      return res.status(404).json({ message: 'Promo code not found' })
    }

    coupon.isActive = !coupon.isActive
    res.json(await coupon.save())
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = mongoose.isValidObjectId(req.params.id) ? await Coupon.findByIdAndDelete(req.params.id) : null

    if (!coupon) {
      return res.status(404).json({ message: 'Promo code not found' })
    }

    res.json({ message: 'Promo code deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Previews the discount at checkout. Orders run the same checks again when placed
export const applyCoupon = async (req, res) => {
  try {
    const { items, error: cartError } = await priceCart(req.body.cartItems)

    if (cartError) {
      return res.status(400).json({ message: cartError })
    }

    const subtotal = items.reduce((acc, { unitPrice, qty }) => acc + unitPrice * qty, 0)
    const { coupon, discount, error } = await checkCoupon(req.body.code, req.user._id, subtotal)

    if (error) {
      return res.status(400).json({ message: error })
    }

    res.json({ code: coupon.code, discountPercent: coupon.discountPercent, discount })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
