import mongoose from 'mongoose'

export const RETURN_REASONS = ['Damaged item', 'Wrong item received', 'Not as described', 'No longer needed', 'Other']

const returnItemSchema = mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    name: { type: String, required: true },
    image: { type: String, required: true },
    color: { type: String },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
)

const returnEventSchema = mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String },
    at: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
)

const returnSchema = mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Order', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    items: [returnItemSchema],
    reason: { type: String, required: true, enum: RETURN_REASONS },
    note: { type: String },
    status: {
      type: String,
      required: true,
      enum: ['Requested', 'Approved', 'Rejected', 'Received', 'Refunded'],
      default: 'Requested',
    },
    isOpen: { type: Boolean, required: true, default: true },
    restocked: { type: Boolean, required: true, default: false },
    refundAmount: { type: Number, required: true, default: 0 },
    refundMethod: { type: String },
    stripeRefundId: { type: String },
    history: [returnEventSchema],
  },
  { timestamps: true }
)

// One open return per order, so two requests can't claim the same items
returnSchema.index({ order: 1, isOpen: 1 }, { unique: true, partialFilterExpression: { isOpen: true } })

const Return = mongoose.model('Return', returnSchema)
export default Return
