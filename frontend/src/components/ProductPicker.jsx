import { useState } from 'react'
import { Form } from 'react-bootstrap'
import { formatPrice } from '../utils/formatPrice'
import { imageUrl } from '../utils/imageUrl'

const MAX_RESULTS = 8

const ProductPicker = ({ products, exclude, onPick, placeholder }) => {
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)

  const query = term.trim().toLowerCase()
  const results = products
    .filter((p) => !exclude.includes(p._id))
    .filter((p) => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(query))
    .slice(0, MAX_RESULTS)

  const pick = (product) => {
    onPick(product)
    setTerm('')
    setOpen(false)
  }

  return (
    <div
      className="product-picker"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      <Form.Control
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        value={term}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setTerm(e.target.value)
          setOpen(true)
        }}
      />

      {open && (
        <div className="picker-results">
          {results.length === 0 ? (
            <p>No matching products</p>
          ) : (
            results.map((product) => (
              <button key={product._id} type="button" onClick={() => pick(product)}>
                <img src={imageUrl(product.image)} alt="" />
                <span>{product.name}</span>
                <strong>{formatPrice(product.price)}</strong>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default ProductPicker
