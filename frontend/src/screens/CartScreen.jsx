import { useSelector, useDispatch } from "react-redux";
import { Row, Col, Image, Button, Form, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { removeFromCart, addToCart } from "../store/slices/cartSlice";
import { createCheckoutSessionThunk } from "../store/slices/paymentSlice";
import { formatPrice } from "../utils/formatPrice";
import { imageUrl } from "../utils/imageUrl";
import { qtyOptions } from "../utils/quantity";
import { usePageTitle } from "../utils/usePageTitle";

const CartScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const { loading } = useSelector((state) => state.payment);
  const { userInfo } = useSelector((state) => state.user);

  usePageTitle("Cart");

  const itemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const qtyChangeHandler = (item, qty) => {
    dispatch(addToCart({ ...item, qty }));
  };

  const handlePayment = async () => {
    // The order is saved against the user after payment, so sign in first
    if (!userInfo) {
      navigate("/login?redirect=/cart");
      return;
    }

    const result = await dispatch(createCheckoutSessionThunk(cartItems));

    if (result.meta.requestStatus === "fulfilled") {
      window.location.href = result.payload.url;
    } else {
      toast.error(result.payload);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="empty-state">
        <h1>Your cart is empty</h1>
        <p>Add something you like and it will show up here.</p>
        <Link to="/" className="btn btn-primary">Browse products</Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="page-title">Shopping cart</h1>
      <Row className="g-4">
        <Col lg={8}>
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <Link to={`/product/${item._id}`} className="cart-item-img">
                <Image src={imageUrl(item.image)} alt={item.name} fluid />
              </Link>
              <div className="cart-item-info">
                <Link to={`/product/${item._id}`} className="product-title">{item.name}</Link>
                <div>{formatPrice(item.price)}</div>
              </div>
              <Form.Select
                className="qty-select"
                aria-label={`Quantity of ${item.name}`}
                value={item.qty}
                onChange={(e) => qtyChangeHandler(item, Number(e.target.value))}
              >
                {qtyOptions(item.countInStock).map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </Form.Select>
              <Button
                type="button"
                variant="light"
                aria-label={`Remove ${item.name}`}
                onClick={() => removeFromCartHandler(item._id)}
              >
                <FaTrash aria-hidden="true" />
              </Button>
            </div>
          ))}
        </Col>

        <Col lg={4}>
          <Card className="summary-card">
            <Card.Body>
              <h2>Order summary</h2>
              <div className="summary-row">
                <span>Items ({itemCount})</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span>Free</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="d-grid mt-3">
                <Button type="button" disabled={loading} onClick={handlePayment}>
                  {loading ? "Processing..." : userInfo ? "Proceed to checkout" : "Sign in to checkout"}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CartScreen;
