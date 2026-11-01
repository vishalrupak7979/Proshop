import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Image, Card, Button, Form, Badge } from 'react-bootstrap'
import { FaArrowLeft } from 'react-icons/fa'
import Loader from '../components/Loader'
import Message from '../components/Message'
import PriceTag from '../components/PriceTag'
import Rating from '../components/Rating'
import { fetchProductById } from '../store/slices/productSlice'
import { addToCart } from '../store/slices/cartSlice'
import { imageUrl } from '../utils/imageUrl'
import { qtyOptions } from '../utils/quantity'
import { usePageTitle } from '../utils/usePageTitle'

const ProductScreen = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { product, loading, error } = useSelector((state) => state.products)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    dispatch(fetchProductById(id))
  }, [dispatch, id])

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }))
    navigate('/cart')
  }

  // The store keeps the last viewed product, so don't flash it here
  const current = product?._id === id ? product : null

  usePageTitle(current?.name)

  return (
    <>
      <Link to="/" className="back-link"><FaArrowLeft aria-hidden="true" /> Back to shop</Link>

      {error ? (
        <Message variant="danger">{error}</Message>
      ) : loading || !current ? (
        <Loader />
      ) : (
        <>
          <Row className="g-4">
            <Col md={6}>
              <div className="product-hero-img">
                <Image src={imageUrl(current.image)} alt={current.name} fluid />
              </div>
            </Col>

            <Col md={6}>
              <div className="product-brand">{current.brand} · {current.category}</div>
              <h1 className="product-name">{current.name}</h1>
              <Rating value={current.rating} text={`${current.rating} (${current.numReviews} reviews)`} />
              <PriceTag product={current} large />
              {current.offerName && <p className="offer-note">{current.offerName}</p>}
              <p className="product-description">{current.description}</p>

              <Card className="buy-box">
                <Card.Body>
                  <div className="summary-row">
                    <span>Status</span>
                    {current.countInStock > 0 ? (
                      <Badge bg="success">In stock</Badge>
                    ) : (
                      <Badge bg="secondary">Out of stock</Badge>
                    )}
                  </div>

                  {current.countInStock > 0 && (
                    <div className="summary-row">
                      <label htmlFor="qty">Quantity</label>
                      <Form.Select
                        id="qty"
                        className="qty-select"
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                      >
                        {qtyOptions(current.countInStock).map((x) => (
                          <option key={x} value={x}>{x}</option>
                        ))}
                      </Form.Select>
                    </div>
                  )}

                  <div className="d-grid mt-3">
                    <Button onClick={addToCartHandler} disabled={current.countInStock === 0} type="button">
                      Add to cart
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <section className="reviews">
            <h2>Customer reviews</h2>
            {current.reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              current.reviews.map((review) => (
                <div key={review._id} className="review">
                  <strong>{review.name}</strong>
                  <Rating value={review.rating} />
                  <p>{review.comment}</p>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </>
  )
}

export default ProductScreen
