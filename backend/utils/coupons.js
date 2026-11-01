import Coupon from '../models/couponModel.js'

export const normalizeCode = (code) => (typeof code === 'string' ? code.trim().toUpperCase() : '')

export const isCouponLive = (coupon, now = new Date()) =>
  Boolean(coupon) &&
  coupon.isActive &&
  coupon.startsAt <= now &&
  coupon.endsAt >= now &&
  !(coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)

export const couponDiscount = (coupon, subtotal) => {
  const discount = Math.round(subtotal * coupon.discountPercent) / 100
  return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount
}

// Returns { coupon, discount } when usable, or { error } with a message for the customer
export const checkCoupon = async (code, userId, subtotal) => {
  const coupon = await Coupon.findOne({ code: normalizeCode(code) })

  if (!coupon || !isCouponLive(coupon)) {
    return { error: 'That promo code is not valid' }
  }
  if (coupon.usedBy.some((id) => id.equals(userId))) {
    return { error: 'You have already used this promo code' }
  }
  if (subtotal < coupon.minOrder) {
    return { error: `This code needs a minimum order of ₹${coupon.minOrder.toLocaleString('en-IN')}` }
  }

  return { coupon, discount: couponDiscount(coupon, subtotal) }
}

// Conditional, so two orders at once can't both take the last use
export const redeemCoupon = async (coupon, userId) => {
  const limit = coupon.usageLimit ? { usedCount: { $lt: coupon.usageLimit } } : {}
  const { modifiedCount } = await Coupon.updateOne(
    { _id: coupon._id, usedBy: { $ne: userId }, ...limit },
    { $inc: { usedCount: 1 }, $addToSet: { usedBy: userId } }
  )
  return modifiedCount === 1
}

// A card payment has already gone through at the discounted price, so it always counts
export const recordCouponUse = (code, userId) =>
  Coupon.updateOne({ code, usedBy: { $ne: userId } }, { $inc: { usedCount: 1 }, $addToSet: { usedBy: userId } })

export const releaseCoupon = (code, userId) =>
  Coupon.updateOne({ code, usedBy: userId }, { $inc: { usedCount: -1 }, $pull: { usedBy: userId } })
