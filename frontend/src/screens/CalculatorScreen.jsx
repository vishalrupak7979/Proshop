import { useEffect, useState } from 'react'
import { Button, Card, Col, Form, Row } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaTrash } from 'react-icons/fa'
import api from '../api/axios'
import Loader from '../components/Loader'
import Message from '../components/Message'
import ProductPicker from '../components/ProductPicker'
import { addToCart } from '../store/slices/cartSlice'
import { formatPrice } from '../utils/formatPrice'
import { imageUrl } from '../utils/imageUrl'
import { qtyOptions } from '../utils/quantity'
import { usePageTitle } from '../utils/usePageTitle'

const rupees = (value) => Math.round(value * 100) / 100

const CalculatorScreen = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [catalogue, setCatalogue] = useState([])
  const [lines, setLines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  usePageTitle('Price calculator')

  useEffect(() => {
    api.get('/products')
      .then(({ data }) => setCatalogue(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (error) return <Message variant="danger">{error}</Message>

  const inStock = catalogue.filter((p) => p.countInStock > 0)
  const rows = lines.map((line) => ({ ...line, product: catalogue.find((p) => p._id === line.id) }))

  const regularTotal = rupees(rows.reduce((acc, { product, qty }) => acc + (product.originalPrice || product.price) * qty, 0))
  const total = rupees(rows.reduce((acc, { product, qty }) => acc + product.price * qty, 0))
  const saved = rupees(regularTotal - total)
  const savedPercent = regularTotal > 0 ? Math.round((saved / regularTotal) * 100) : 0

  const setQty = (id, qty) =>
    setLines((current) => current.map((line) => (line.id === id ? { ...line, qty } : line)))

  const addAllToCart = () => {
    rows.forEach(({ product, qty }) => dispatch(addToCart({ ...product, qty })))
    navigate('/cart')
  }

  return (
    <>
      <h1 className="page-title">Price calculator</h1>
      <p className="page-subtitle">Add products to see your total and savings, including any live offers.</p>

      <Row className="g-4">
        <Col lg={8}>
          <div className="tool-picker">
            <ProductPicker
              products={inStock}
              exclude={lines.map((line) => line.id)}
              placeholder="Search for a product to add"
              onPick={(product) => setLines((current) => [...current, { id: product._id, qty: 1 }])}
            />
          </div>

          {rows.length === 0 ? (
            <div className="empty-state">
              <h2>Nothing added yet</h2>
              <p>Search for a product above to start.</p>
            </div>
          ) : (
            rows.map(({ product, qty }) => (
              <div key={product._id} className="cart-item">
                <div className="cart-item-img">
                  <img src={imageUrl(product.image)} alt="" />
                </div>
                <div className="cart-item-info">
                  <span className="product-title">{product.name}</span>
                  <div>
                    {formatPrice(product.price)}
                    {product.discountPercent && (
                      <s className="price-original">{formatPrice(product.originalPrice)}</s>
                    )}
                  </div>
                </div>
                <Form.Select
                  className="qty-select"
                  aria-label={`Quantity of ${product.name}`}
                  value={qty}
                  onChange={(e) => setQty(product._id, Number(e.target.value))}
                >
                  {qtyOptions(product.countInStock).map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </Form.Select>
                <strong className="line-total">{formatPrice(rupees(product.price * qty))}</strong>
                <Button
                  type="button"
                  variant="light"
                  aria-label={`Remove ${product.name}`}
                  onClick={() => setLines((current) => current.filter((line) => line.id !== product._id))}
                >
                  <FaTrash aria-hidden="true" />
                </Button>
              </div>
            ))
          )}
        </Col>

        <Col lg={4}>
          <Card className="summary-card">
            <Card.Body>
              <h2>Your estimate</h2>
              <div className="summary-row">
                <span>Regular price</span>
                <span>{formatPrice(regularTotal)}</span>
              </div>
              <div className="summary-row">
                <span>Offer discount</span>
                <span>{saved > 0 ? `− ${formatPrice(saved)}` : formatPrice(0)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span>Free</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              {saved > 0 && (
                <p className="calculator-saving">You save {formatPrice(saved)} ({savedPercent}%)</p>
              )}
              <div className="d-grid mt-3">
                <Button type="button" disabled={rows.length === 0} onClick={addAllToCart}>Add all to cart</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default CalculatorScreen
