import mongoose from 'mongoose'
import Notification from '../models/notificationModel.js'
import notify, { audienceIds } from '../utils/notify.js'
import { isSafeLink } from '../utils/safeLink.js'

const LIST_SIZE = 30
const MAX_TITLE = 80
const MAX_MESSAGE = 300

export const getNotifications = async (req, res) => {
  try {
    const [notifications, unread] = await Promise.all([
      Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(LIST_SIZE),
      Notification.countDocuments({ user: req.user._id, read: false }),
    ])

    res.json({ notifications, unread })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true })
    res.json({ message: 'All read' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const markRead = async (req, res) => {
  try {
    const notification = mongoose.isValidObjectId(req.params.id)
      ? await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true })
      : null

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    res.json(notification)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ADMIN: Send a message to customers, partners or everyone
export const broadcast = async (req, res) => {
  try {
    const text = (key) => (typeof req.body[key] === 'string' ? req.body[key].trim() : '')
    const title = text('title')
    const message = text('message')
    const link = text('link')
    const { audience } = req.body

    if (!title || !message || title.length > MAX_TITLE || message.length > MAX_MESSAGE) {
      return res.status(400).json({ message: 'Enter a title up to 80 characters and a message up to 300' })
    }
    if (!['customers', 'partners', 'all'].includes(audience)) {
      return res.status(400).json({ message: 'Choose who to send this to' })
    }
    if (link && !isSafeLink(link)) {
      return res.status(400).json({ message: 'Links must start with / or https://' })
    }

    const ids = await audienceIds(audience)
    await notify(ids, { title, message, link: link || undefined })

    res.status(201).json({ sent: ids.length })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
