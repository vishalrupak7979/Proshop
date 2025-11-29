import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Image, ListGroup, Card, Button, Form } from 'react-bootstrap'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { fetchProductById } from '../store/slices/productSlice'
import { addToCart } from '../store/slices/cartSlice'

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

  return (
    <>
      <Button className="btn btn-light my-3" onClick={() => navigate(-1)}>
        Go Back
      </Button>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : product ? (
        <Row>
          <Col md={6}>
          
            <Image  src={`${import.meta.env.VITE_API_URL}${product.image}`}  alt={product.name} fluid />
          </Col>

          <Col md={3}>
            <ListGroup variant="flush">
              <ListGroup.Item><h3>{product.name}</h3></ListGroup.Item>
              <ListGroup.Item>Price: ₹{product.price}</ListGroup.Item>
              <ListGroup.Item>Description: {product.description}</ListGroup.Item>
            </ListGroup>
          </Col>

          <Col md={3}>
            <Card>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Price:</Col>
                    <Col><strong>₹{product.price}</strong></Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Status:</Col>
                    <Col>{product.countInStock > 0 ? 'In Stock' : 'Out Of Stock'}</Col>
                  </Row>
                </ListGroup.Item>

                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <Row>
                      <Col>Qty</Col>
                      <Col>
                        <Form.Select value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                          {[...Array(product.countInStock).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>{x + 1}</option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )}

                <ListGroup.Item>
                  <div className="d-grid">
                    <Button onClick={addToCartHandler} disabled={product.countInStock === 0} type="button">
                      Add To Cart
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      ) : null}
    </>
  )
}

export default ProductScreen
