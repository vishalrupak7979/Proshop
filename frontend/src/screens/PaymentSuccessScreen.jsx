import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { confirmStripeOrder } from "../store/slices/orderSlice";
import { clearCart } from "../store/slices/cartSlice";
import { clearPromoCode } from "../utils/promoCode";
import Loader from "../components/Loader";
import { usePageTitle } from "../utils/usePageTitle";

const PaymentSuccessScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  const [failed, setFailed] = useState(false);
  // StrictMode runs effects twice in dev, and one request is enough
  const started = useRef(false);

  usePageTitle("Confirming order");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!sessionId) {
      setFailed(true);
      return;
    }

    dispatch(confirmStripeOrder(sessionId)).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        clearPromoCode();
        dispatch(clearCart());
        navigate(`/order/${result.payload._id}`, { replace: true });
      } else {
        setFailed(true);
      }
    });
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
