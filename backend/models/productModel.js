import mongoose from 'mongoose'

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true }
  },
  { timestamps: true }
)

const specificationSchema = mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
)

const colorSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
    image: { type: String },
  },
  { _id: false }
)

const productSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    image: { type: String, required: true },
    images: [{ type: String }],
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    specifications: [specificationSchema],
    colors: [colorSchema],
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
)

const Product = mongoose.model('Product', productSchema)
export default Product
