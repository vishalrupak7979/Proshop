import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { createOrder } from "../store/slices/orderSlice";
import { clearCart } from "../store/slices/cartSlice";
import axios from "../api/axios";
import Loader from "../components/Loader";

const PaymentSuccessScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  const [failed, setFailed] = useState(false);
  // StrictMode runs effects twice in dev, which would create duplicate orders
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const processOrder = async () => {
      const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

      if (!sessionId || cartItems.length === 0) {
        setFailed(true);
        return;
      }

      const { data: session } = await axios.get(`/payment/session/${sessionId}`);

      if (session.payment_status !== "paid") {
        setFailed(true);
        return;
      }

      const stripeShipping = session.customer_details?.address;

      const itemsPrice = cartItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
      );

      const orderData = {
        orderItems: cartItems.map((item) => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          product: item._id,
        })),
        shippingAddress: {
          address: stripeShipping?.line1 || "Not Provided",
          city: stripeShipping?.city || "Unknown",
          postalCode: stripeShipping?.postal_code || "000000",
          country: stripeShipping?.country || "Unknown",
        },
        paymentMethod: "Stripe",
        itemsPrice,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: itemsPrice,
      };

      const result = await dispatch(createOrder(orderData));

      if (result.meta.requestStatus === "fulfilled") {
        dispatch(clearCart());
        navigate(`/order/${result.payload._id}`, { replace: true });
      } else {
        setFailed(true);
      }
    };

    processOrder().catch(() => setFailed(true));
  }, [dispatch, sessionId, navigate]);

  if (failed) {
    return (
      <div className="empty-state">
        <h1>We couldn&apos;t confirm your order</h1>
        <p>If you were charged, check your orders or contact support before paying again.</p>
        <Link to="/profile" className="btn btn-primary">View my orders</Link>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <h1>Confirming your order</h1>
      <p>Please keep this page open.</p>
      <Loader />
    </div>
  );
};

export default PaymentSuccessScreen;
