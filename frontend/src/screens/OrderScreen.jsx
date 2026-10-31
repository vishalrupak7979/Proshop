import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Card, Badge, Image } from "react-bootstrap";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { getOrderById } from "../store/slices/orderSlice";
import { formatPrice } from "../utils/formatPrice";
import { imageUrl } from "../utils/imageUrl";

const OrderScreen = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(getOrderById(id));
  }, [dispatch, id]);

  if (error) return <Message variant="danger">{error}</Message>;
  if (loading || order?._id !== id) return <Loader />;

  const { shippingAddress: address } = order;

  return (
    <>
      <h1 className="page-title">Order #{order._id.slice(-8).toUpperCase()}</h1>
      <p className="page-subtitle">
        Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
      </p>

      <Row className="g-4">
        <Col lg={8}>
          {order.orderItems.map((item) => (
            <div key={item.product} className="cart-item">
              <Link to={`/product/${item.product}`} className="cart-item-img">
                <Image src={imageUrl(item.image)} alt={item.name} fluid />
              </Link>
              <div className="cart-item-info">
                <Link to={`/product/${item.product}`} className="product-title">{item.name}</Link>
                <div>{item.qty} × {formatPrice(item.price)}</div>
              </div>
              <strong>{formatPrice(item.qty * item.price)}</strong>
            </div>
          ))}
        </Col>

        <Col lg={4}>
          <Card className="summary-card">
            <Card.Body>
              <h2>Summary</h2>
              <div className="summary-row">
                <span>Delivery</span>
                {order.isDelivered ? <Badge bg="success">Delivered</Badge> : <Badge bg="warning" text="dark">On the way</Badge>}
              </div>
              <div className="summary-row">
                <span>Payment method</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>

              <h2 className="mt-4">Delivery address</h2>
              <address className="mb-0">
                {address.address}<br />
                {address.city} {address.postalCode}<br />
                {address.country}
              </address>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
