import mongoose from 'mongoose'

const adSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    text: { type: String },
    image: { type: String, required: true },
    link: { type: String },
    startsAt: { type: Date },
    endsAt: { type: Date },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
)

const Ad = mongoose.model('Ad', adSchema)
export default Ad
