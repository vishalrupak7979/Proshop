import mongoose from 'mongoose'

export const QUERY_TOPICS = ['Order', 'Product', 'Payment', 'Delivery', 'Return', 'Other']

const messageSchema = mongoose.Schema(
  {
    fromAdmin: { type: Boolean, required: true, default: false },
    name: { type: String, required: true },
    text: { type: String, required: true },
    at: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
)

const querySchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true, enum: QUERY_TOPICS },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    status: { type: String, required: true, enum: ['Open', 'Answered', 'Closed'], default: 'Open' },
    messages: [messageSchema],
  },
  { timestamps: true }
)

const Query = mongoose.model('Query', querySchema)
export default Query
