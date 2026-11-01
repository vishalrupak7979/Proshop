import mongoose from 'mongoose'

const NINETY_DAYS = 90 * 24 * 60 * 60

const notificationSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, required: true, default: false },
    createdAt: { type: Date, default: Date.now, expires: NINETY_DAYS },
  }
)

const Notification = mongoose.model('Notification', notificationSchema)
export default Notification
