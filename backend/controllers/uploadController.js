import mongoose from 'mongoose'
import Image from '../models/imageModel.js'

const IMAGE_PATH = /^\/api\/images\/([a-f0-9]{24})$/
const ONE_YEAR = 365 * 24 * 60 * 60

// Checks the file itself, because the content type header can say anything
const detectType = (buffer) => {
  if (buffer.length < 12) return null
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (buffer.toString('latin1', 1, 4) === 'PNG') return 'image/png'
  if (buffer.toString('latin1', 0, 4) === 'RIFF' && buffer.toString('latin1', 8, 12) === 'WEBP') return 'image/webp'
  return null
}

export const uploadImage = async (req, res) => {
  try {
    const contentType = Buffer.isBuffer(req.body) ? detectType(req.body) : null

    if (!contentType) {
      return res.status(400).json({ message: 'Upload a JPG, PNG or WebP image' })
    }

    const image = await Image.create({ data: req.body, contentType })
    res.status(201).json({ image: `/api/images/${image._id}` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getImage = async (req, res) => {
  try {
    const image = mongoose.isValidObjectId(req.params.id) ? await Image.findById(req.params.id) : null

    if (!image) {
      return res.status(404).json({ message: 'Image not found' })
    }

    res.set('Content-Type', image.contentType)
    res.set('Cache-Control', `public, max-age=${ONE_YEAR}, immutable`)
    res.send(image.data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteUploadedImage = async (path) => {
  const id = path?.match(IMAGE_PATH)?.[1]
  if (id) {
    await Image.deleteOne({ _id: id }).catch(() => {})
  }
}
