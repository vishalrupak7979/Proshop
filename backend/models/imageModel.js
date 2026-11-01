import mongoose from 'mongoose'

// Uploads live in the database because Render's disk is wiped on every deploy
const imageSchema = mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
  },
  { timestamps: true }
)

const Image = mongoose.model('Image', imageSchema)
export default Image
