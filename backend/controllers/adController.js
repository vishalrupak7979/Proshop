import mongoose from 'mongoose'
import Ad from '../models/adModel.js'
import { deleteUploadedImage } from './uploadController.js'
import { isSafeLink } from '../utils/safeLink.js'

const readAd = (body) => {
  const text = (key) => (typeof body[key] === 'string' ? body[key].trim() : '')
  const date = (key) => (body[key] ? new Date(body[key]) : undefined)
  const startsAt = date('startsAt')
  const endsAt = date('endsAt')

  if (!text('title')) {
    return { error: 'Give the advert a title' }
  }
  if (!text('image')) {
    return { error: 'Add an advert image' }
  }
  if (text('link') && !isSafeLink(text('link'))) {
    return { error: 'Links must start with / or https://' }
  }
  if ([startsAt, endsAt].some((value) => value && Number.isNaN(value.getTime()))) {
    return { error: 'Enter valid dates' }
  }
  if (startsAt && endsAt && endsAt <= startsAt) {
    return { error: 'The advert must end after it starts' }
  }

  return {
    fields: {
      title: text('title'),
      text: text('text'),
      image: text('image'),
      link: text('link'),
      startsAt,
      endsAt,
      isActive: body.isActive !== false,
    },
  }
}

const findAd = async (id) => (mongoose.isValidObjectId(id) ? Ad.findById(id) : null)

// What customers see
export const getLiveAds = async (req, res) => {
  try {
    const now = new Date()
    const ads = await Ad.find({
      isActive: true,
      $and: [
        { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
      ],
    }).sort({ createdAt: -1 })

    res.json(ads)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getAllAds = async (req, res) => {
  try {
    res.json(await Ad.find({}).sort({ createdAt: -1 }))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const createAd = async (req, res) => {
  try {
    const { fields, error } = readAd(req.body)

    if (error) {
      return res.status(400).json({ message: error })
    }

    res.status(201).json(await Ad.create(fields))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateAd = async (req, res) => {
  try {
    const ad = await findAd(req.params.id)

    if (!ad) {
      return res.status(404).json({ message: 'Advert not found' })
    }

    const { fields, error } = readAd(req.body)

    if (error) {
      return res.status(400).json({ message: error })
    }

    const oldImage = ad.image
    ad.set(fields)
    await ad.save()

    if (oldImage !== fields.image) {
      await deleteUploadedImage(oldImage)
    }

    res.json(ad)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteAd = async (req, res) => {
  try {
    const ad = await findAd(req.params.id)

    if (!ad) {
      return res.status(404).json({ message: 'Advert not found' })
    }

    await ad.deleteOne()
    await deleteUploadedImage(ad.image)
    res.json({ message: 'Advert deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
