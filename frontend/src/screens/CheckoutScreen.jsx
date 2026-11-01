import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Card, Form, Button } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import { FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../api/axios";
import { clearCart, refreshCartItems, saveShippingAddress, savePaymentMethod } from "../store/slices/cartSlice";
import { createCheckoutSessionThunk } from "../store/slices/paymentSlice";
import { createCodOrder } from "../store/slices/orderSlice";
import Message from "../components/Message";
import { formatPrice } from "../utils/formatPrice";
import { usePageTitle } from "../utils/usePageTitle";

const EMPTY_ADDRESS = { address: "", city: "", postalCode: "", phone: "" };

const CheckoutScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, shippingAddress, paymentMethod } = useSelector((state) => state.cart);
  const { loading: redirecting } = useSelector((state) => state.payment);

  const [method, setMethod] = useState(paymentMethod === "Stripe" ? "Stripe" : "COD");
  const [address, setAddress] = useState({ ...EMPTY_ADDRESS, ...shippingAddress });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  usePageTitle("Checkout");

  useEffect(() => {
    api.get("/products").then(({ data }) => dispatch(refreshCartItems(data))).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    dispatch(savePaymentMethod(method));
  }, [dispatch, method]);

  if (cartItems.length === 0 && !placing) {
    return <Navigate to="/cart" replace />;
  }

  const itemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  const setField = (field) => (e) => setAddress({ ...address, [field]: e.target.value });

  const payByCard = async () => {
    const result = await dispatch(createCheckoutSessionThunk(cartItems));

    if (result.meta.requestStatus === "fulfilled") {
      window.location.href = result.payload.url;
    } else {
      setError(result.payload);
    }
  };

  const placeCodOrder = async () => {
    setPlacing(true);
    dispatch(saveShippingAddress(address));

    const result = await dispatch(createCodOrder({ cartItems, shippingAddress: address }));

    if (result.meta.requestStatus === "fulfilled") {
      dispatch(clearCart());
      toast.success("Order placed");
      navigate(`/order/${result.payload._id}`, { replace: true });
    } else {
      setError(result.payload);
      setPlacing(false);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setError("");
    if (method === "COD") {
      placeCodOrder();
    } else {
      payByCard();
    }
  };

  const busy = placing || redirecting;

  return (
    <>
      <h1 className="page-title">Checkout</h1>
      {error && <Message variant="danger">{error}</Message>}

      <Form onSubmit={submitHandler}>
        <Row className="g-4">
          <Col lg={8}>
            <Card className="checkout-card">
              <Card.Body>
                <h2>Payment method</h2>

                <label className={`payment-option ${method === "COD" ? "is-selected" : ""}`}>
                  <Form.Check
                    type="radio"
                    name="payment"
                    id="pay-cod"
                    checked={method === "COD"}
                    onChange={() => setMethod("COD")}
                    aria-label="Cash on delivery"
                  />
                  <FaMoneyBillWave aria-hidden="true" />
                  <span>
                    <strong>Cash on delivery</strong>
                    <small>Pay in cash when your order arrives</small>
                  </span>
                </label>

                <label className={`payment-option ${method === "Stripe" ? "is-selected" : ""}`}>
                  <Form.Check
                    type="radio"
                    name="payment"
                    id="pay-card"
                    checked={method === "Stripe"}
                    onChange={() => setMethod("Stripe")}
                    aria-label="Card"
                  />
                  <FaCreditCard aria-hidden="true" />
                  <span>
                    <strong>Card</strong>
                    <small>Pay now on Stripe&apos;s secure page, where you&apos;ll add your address</small>
                  </span>
                </label>
              </Card.Body>
            </Card>

            {method === "COD" && (
              <Card className="checkout-card">
                <Card.Body>
                  <h2>Delivery address</h2>

                  <Form.Group controlId="address" className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control autoComplete="street-address" required value={address.address} onChange={setField("address")} />
                  </Form.Group>

                  <Row className="g-3">
                    <Col sm={6}>
                      <Form.Group controlId="city">
                        <Form.Label>City</Form.Label>
                        <Form.Control autoComplete="address-level2" required value={address.city} onChange={setField("city")} />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group controlId="postalCode">
                        <Form.Label>PIN code</Form.Label>
                        <Form.Control autoComplete="postal-code" inputMode="numeric" required pattern="\d{6}" title="6 digit PIN code" value={address.postalCode} onChange={setField("postalCode")} />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group controlId="phone">
                        <Form.Label>Mobile number</Form.Label>
                        <Form.Control type="tel" autoComplete="tel-national" inputMode="numeric" required pattern="[6-9]\d{9}" title="10 digit mobile number" value={address.phone} onChange={setField("phone")} />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}
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
                  <span>{method === "COD" ? "Pay on delivery" : "Total"}</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="d-grid mt-3">
                  <Button type="submit" disabled={busy}>
                    {busy ? "Processing..." : method === "COD" ? "Place order" : "Continue to payment"}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default CheckoutScreen;
