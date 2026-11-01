import Notification from '../models/notificationModel.js'
import User from '../models/userModel.js'

// A failed notification must never fail the order that triggered it
const notify = async (userIds, { title, message, link }) => {
  try {
    const ids = [userIds].flat().filter(Boolean)
    if (ids.length > 0) {
      await Notification.insertMany(ids.map((user) => ({ user, title, message, link })))
    }
  } catch (err) {
    console.error(`Notification failed: ${err.message}`)
  }
}

export const adminIds = async () => (await User.find({ isAdmin: true }).select('_id')).map((user) => user._id)

export const audienceIds = async (audience) => {
  const filter = {
    customers: { isAdmin: false, isDeliveryPartner: false },
    partners: { isDeliveryPartner: true },
    all: {},
  }[audience]

  return (await User.find(filter).select('_id')).map((user) => user._id)
}

export default notify
