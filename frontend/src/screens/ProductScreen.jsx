import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Card, Button, Form, Badge, Table } from 'react-bootstrap'
import { FaCheck } from 'react-icons/fa'
import Loader from '../components/Loader'
import Message from '../components/Message'
import PriceTag from '../components/PriceTag'
import ProductGallery from '../components/ProductGallery'
import Rating from '../components/Rating'
import { fetchProductById } from '../store/slices/productSlice'
import { addToCart } from '../store/slices/cartSlice'
import { withColor } from '../utils/cartLine'
import { qtyOptions } from '../utils/quantity'
import { usePageTitle } from '../utils/usePageTitle'

const LOW_STOCK = 5

const ProductScreen = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { product, loading, error } = useSelector((state) => state.products)
  const [qty, setQty] = useState(1)
  const [colorName, setColorName] = useState(null)
  const [photo, setPhoto] = useState(null)

  useEffect(() => {
    dispatch(fetchProductById(id))
    setQty(1)
    setColorName(null)
    setPhoto(null)
  }, [dispatch, id])

  // The store keeps the last viewed product, so don't flash it here
  const current = product?._id === id ? product : null

  usePageTitle(current?.name)

  const color = current?.colors?.find((c) => c.name === colorName) || current?.colors?.[0]
  const images = current ? [...new Set([current.image, ...current.images, ...current.colors.map((c) => c.image).filter(Boolean)])] : []

  const chooseColor = (choice) => {
    setColorName(choice.name)
    if (choice.image) setPhoto(choice.image)
  }

  const addToCartHandler = () => {
    dispatch(addToCart({ ...withColor(current, color), qty }))
    navigate('/cart')
  }

  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumbs">
        <Link to="/">Shop</Link>
        {current && (
          <>
            <span aria-hidden="true">/</span>
            <Link to={`/?category=${encodeURIComponent(current.category)}`}>{current.category}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{current.name}</span>
          </>
        )}
      </nav>

      {error ? (
        <Message variant="danger">{error}</Message>
      ) : loading || !current ? (
        <Loader />
      ) : (
        <>
          <Row className="g-4">
            <Col md={6}>
              <ProductGallery
                images={images}
                selected={photo || color?.image || current.image}
                onSelect={setPhoto}
                name={current.name}
              />
            </Col>

            <Col md={6}>
              <div className="product-brand">{current.brand}</div>
              <h1 className="product-name">{current.name}</h1>
              <Rating value={current.rating} text={`${current.rating} (${current.numReviews} reviews)`} />
              <PriceTag product={current} large />
              {current.offerName && <p className="offer-note">{current.offerName}</p>}
              <p className="product-description">{current.description}</p>

              {current.colors.length > 0 && (
                <div className="color-picker">
                  <div className="color-label">Colour: <strong>{color.name}</strong></div>
                  <div className="color-swatches" role="group" aria-label="Choose a colour">
                    {current.colors.map((choice) => (
                      <button
                        key={choice.name}
                        type="button"
                        className={choice.name === color.name ? 'color-swatch is-selected' : 'color-swatch'}
                        style={{ backgroundColor: choice.hex }}
                        title={choice.name}
                        aria-label={choice.name}
                        aria-pressed={choice.name === color.name}
                        onClick={() => chooseColor(choice)}
                      >
                        {choice.name === color.name && <FaCheck aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Card className="buy-box">
                <Card.Body>
                  <div className="summary-row">
                    <span>Status</span>
                    {current.countInStock === 0 ? (
                      <Badge bg="secondary">Out of stock</Badge>
                    ) : current.countInStock <= LOW_STOCK ? (
                      <Badge bg="warning" text="dark">Only {current.countInStock} left</Badge>
                    ) : (
                      <Badge bg="success">In stock</Badge>
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

          <Row className="g-4 product-sections">
            <Col lg={7}>
              <section>
                <h2>Specifications</h2>
                <Table className="data-table spec-table">
                  <tbody>
                    <tr>
                      <th scope="row">Brand</th>
                      <td>{current.brand}</td>
                    </tr>
                    <tr>
                      <th scope="row">Category</th>
                      <td>{current.category}</td>
                    </tr>
                    {current.colors.length > 0 && (
                      <tr>
                        <th scope="row">Colours</th>
                        <td>{current.colors.map((c) => c.name).join(', ')}</td>
                      </tr>
                    )}
                    {current.specifications.map((spec) => (
                      <tr key={spec.label}>
                        <th scope="row">{spec.label}</th>
                        <td>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </section>
            </Col>

            <Col lg={5}>
              <section className="reviews">
                <h2>Customer reviews</h2>
                <Link
                  to={`/queries?product=${current._id}&topic=Product&subject=${encodeURIComponent(`Question about ${current.name}`)}`}
                  className="help-link"
                >
                  Have a question about this product?
                </Link>
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
            </Col>
          </Row>
        </>
      )}
    </>
  )
}

export default ProductScreen
