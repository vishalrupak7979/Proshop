import Offer from '../models/offerModel.js'

export const getLiveOffers = () => {
  const now = new Date()
  return Offer.find({ isActive: true, startsAt: { $lte: now }, endsAt: { $gte: now } })
}

const offerApplies = (offer, product) => {
  if (offer.appliesTo === 'all') return true
  if (offer.appliesTo === 'category') return offer.categories.includes(product.category)
  return offer.products.some((id) => id.equals(product._id))
}

// When several offers apply, the customer gets the biggest discount
export const withOffer = (product, offers) => {
  const plain = product.toObject()
  const best = offers
    .filter((offer) => offerApplies(offer, product))
    .sort((a, b) => b.discountPercent - a.discountPercent)[0]

  if (!best) return plain

  return {
    ...plain,
    originalPrice: plain.price,
    price: Math.round(plain.price * (100 - best.discountPercent)) / 100,
    discountPercent: best.discountPercent,
    offerName: best.name,
  }
}
