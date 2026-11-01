import mongoose from 'mongoose'

const offerSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    discountPercent: { type: Number, required: true, min: 1, max: 90 },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    appliesTo: { type: String, required: true, enum: ['all', 'category', 'products'], default: 'all' },
    categories: [{ type: String }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
)

const Offer = mongoose.model('Offer', offerSchema)
export default Offer
