import mongoose from 'mongoose'

const couponSchema = mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountPercent: { type: Number, required: true, min: 1, max: 90 },
    maxDiscount: { type: Number, min: 0 },
    minOrder: { type: Number, min: 0, default: 0 },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    usageLimit: { type: Number, min: 1 },
    usedCount: { type: Number, required: true, default: 0 },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
)

const Coupon = mongoose.model('Coupon', couponSchema)
export default Coupon
