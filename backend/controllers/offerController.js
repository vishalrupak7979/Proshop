import mongoose from 'mongoose'
import Offer from '../models/offerModel.js'
import notify, { audienceIds } from '../utils/notify.js'

const readOffer = (body) => {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const discountPercent = Number(body.discountPercent)
  const startsAt = new Date(body.startsAt)
  const endsAt = new Date(body.endsAt)
  const { appliesTo } = body
  const categories = Array.isArray(body.categories) ? body.categories.filter((c) => typeof c === 'string' && c) : []
  const products = Array.isArray(body.products) ? body.products.filter((id) => mongoose.isValidObjectId(id)) : []

  if (!name) {
    return { error: 'Give the offer a name' }
  }
  if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 90) {
    return { error: 'Discount must be between 1 and 90 percent' }
  }
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
    return { error: 'The offer must end after it starts' }
  }
  if (!['all', 'category', 'products'].includes(appliesTo)) {
    return { error: 'Choose what the offer applies to' }
  }
  if (appliesTo === 'category' && categories.length === 0) {
    return { error: 'Choose at least one category' }
  }
  if (appliesTo === 'products' && products.length === 0) {
    return { error: 'Choose at least one product' }
  }

  return {
    fields: {
      name,
      discountPercent,
      startsAt,
      endsAt,
      appliesTo,
      categories: appliesTo === 'category' ? categories : [],
      products: appliesTo === 'products' ? products : [],
      isActive: body.isActive !== false,
    },
  }
}

export const getOffers = async (req, res) => {
  try {
    res.json(await Offer.find({}).sort({ startsAt: -1 }))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const createOffer = async (req, res) => {
  try {
    const { fields, error } = readOffer(req.body)

    if (error) {
      return res.status(400).json({ message: error })
    }

    const offer = await Offer.create(fields)

    if (req.body.notifyCustomers === true) {
      await notify(await audienceIds('customers'), {
        title: offer.name,
        message: `${offer.discountPercent}% off, ending ${offer.endsAt.toLocaleDateString('en-IN')}`,
        link: '/',
      })
    }

    res.status(201).json(offer)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateOffer = async (req, res) => {
  try {
    const offer = mongoose.isValidObjectId(req.params.id) ? await Offer.findById(req.params.id) : null

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' })
    }

    const { fields, error } = readOffer(req.body)

    if (error) {
      return res.status(400).json({ message: error })
    }

    offer.set(fields)
    res.json(await offer.save())
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteOffer = async (req, res) => {
  try {
    const offer = mongoose.isValidObjectId(req.params.id) ? await Offer.findByIdAndDelete(req.params.id) : null

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' })
    }

    res.json({ message: 'Offer deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
