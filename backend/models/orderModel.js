import mongoose from 'mongoose'

export const ORDER_STATUSES = [
  'Placed',
  'Assigned',
  'Picked up',
  'Out for delivery',
  'Delivered',
  'Failed',
  'Cancelled',
]

const statusEventSchema = mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String },
    at: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
)

const locationSchema = mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
    label: { type: String },
    updatedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
)

const orderItemSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    image: { type: String, required: true },
    color: { type: String },
    price: { type: Number, required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
  },
  { _id: false }
)

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    orderItems: [orderItemSchema],

    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String },
    },

    paymentMethod: { type: String, required: true },
    stripeSessionId: { type: String, unique: true, sparse: true },

    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    couponCode: { type: String },
    discountPrice: { type: Number, required: true, default: 0.0 },
    refundedAmount: { type: Number, required: true, default: 0.0 },

    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },

    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },

    // Orders from before delivery tracking have no status saved
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: function () {
        return this.isDelivered ? 'Delivered' : 'Placed'
      },
    },
    statusHistory: [statusEventSchema],

    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    currentLocation: { type: locationSchema },

    codCollected: { type: Boolean, required: true, default: false },
    codCollectedAt: { type: Date },
  },
  { timestamps: true }
)

const Order = mongoose.model('Order', orderSchema)

export default Order
