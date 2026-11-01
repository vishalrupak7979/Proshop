import { useState } from 'react'
import { Form } from 'react-bootstrap'
import api from '../api/axios'
import { imageUrl } from '../utils/imageUrl'

const MAX_SIDE = 1400
const QUALITY = 0.85

// Phone photos are several MB, and shrinking them here keeps the database small
const shrinkImage = async (file) => {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY))
}

const ImagePicker = ({ value, onChange, label = 'Image', id = 'image' }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const pickFile = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const blob = await shrinkImage(file)
      const { data } = await api.post('/images', blob, { headers: { 'Content-Type': blob.type } })
      onChange(data.image)
    } catch (err) {
      setError(err.response?.data?.message || 'That image could not be uploaded')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Form.Group controlId={id} className="mb-3">
      <Form.Label>{label}</Form.Label>
      {value && <img className="image-preview" src={imageUrl(value)} alt="Selected preview" />}
      <Form.Control type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={pickFile} />
      {uploading && <Form.Text>Uploading...</Form.Text>}
      {error && <Form.Text className="text-danger">{error}</Form.Text>}
    </Form.Group>
  )
}

export default ImagePicker
