import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Card, Image } from "react-bootstrap";
import Loader from "../components/Loader";
import Message from "../components/Message";
import OrderReturns from "../components/OrderReturns";
import OrderTracker from "../components/OrderTracker";
import StatusBadge from "../components/StatusBadge";
import { getOrderById } from "../store/slices/orderSlice";
import { formatPrice } from "../utils/formatPrice";
import { imageUrl } from "../utils/imageUrl";
import { isOrderActive, paymentLabel } from "../utils/orderStatus";
import { usePageTitle } from "../utils/usePageTitle";

const REFRESH_MS = 20000;

const OrderScreen = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, error } = useSelector((state) => state.orders);

  usePageTitle("Order details");

  useEffect(() => {
    dispatch(getOrderById(id));
  }, [dispatch, id]);

  const current = order?._id === id ? order : null;
  const active = current ? isOrderActive(current.status) : false;

  // Keep tracking up to date without the customer reloading the page
  useEffect(() => {
    if (!active) return undefined;
    const timer = setInterval(() => dispatch(getOrderById(id)), REFRESH_MS);
    return () => clearInterval(timer);
  }, [active, dispatch, id]);

  if (error && !current) return <Message variant="danger">{error}</Message>;
  if (!current) return <Loader />;

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
            <div key={`${item.product}-${item.color}`} className="cart-item">
              <Link to={`/product/${item.product}`} className="cart-item-img">
                <Image src={imageUrl(item.image)} alt={item.name} fluid />
              </Link>
              <div className="cart-item-info">
                <Link to={`/product/${item.product}`} className="product-title">{item.name}</Link>
                {item.color && <div className="table-muted">{item.color}</div>}
                <div>{item.qty} × {formatPrice(item.price)}</div>
              </div>
              <strong>{formatPrice(item.qty * item.price)}</strong>
            </div>
          ))}

          <OrderTracker order={order} />
          {order.isDelivered && <OrderReturns orderId={order._id} />}
        </Col>

        <Col lg={4}>
          <Card className="summary-card">
            <Card.Body>
              <h2>Summary</h2>
              <div className="summary-row">
                <span>Status</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="summary-row">
                <span>Payment</span>
                <span>{paymentLabel(order)}</span>
              </div>
              {order.discountPrice > 0 && (
                <>
                  <div className="summary-row">
                    <span>Items</span>
                    <span>{formatPrice(order.itemsPrice)}</span>
                  </div>
                  <div className="summary-row promo-saving">
                    <span>Promo {order.couponCode}</span>
                    <span>− {formatPrice(order.discountPrice)}</span>
                  </div>
                </>
              )}
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
              {order.refundedAmount > 0 && (
                <div className="summary-row promo-saving">
                  <span>Refunded</span>
                  <span>{formatPrice(order.refundedAmount)}</span>
                </div>
              )}

              <h2 className="mt-4">Delivery address</h2>
              <address className="mb-0">
                {address.address}<br />
                {address.city} {address.postalCode}<br />
                {address.country}
                {address.phone && <><br />{address.phone}</>}
              </address>

              <Link to={`/queries?order=${order._id}&topic=Order`} className="help-link">
                Need help with this order?
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
