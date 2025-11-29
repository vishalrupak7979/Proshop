// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { createOrder } from "../store/slices/orderSlice";
// import { clearCart } from "../store/slices/cartSlice";
// import axios from "../api/axios";

// const PaymentSuccessScreen = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [params] = useSearchParams();

//   const sessionId = params.get("session_id");

//   useEffect(() => {
//     const processOrder = async () => {
//       if (!sessionId) return;

//       // ⭐ Fetch Stripe Session Details
//       const { data: session } = await axios.get(
//         `/payment/session/${sessionId}`
//       );

//       // ⭐ Get cart from local storage
//       const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

//       if (cartItems.length === 0) return;

//       // ⭐ Construct Order Data
//       const itemsPrice = cartItems.reduce(
//         (acc, item) => acc + item.price * item.qty,
//         0
//       );

//       const orderData = {
//         orderItems: cartItems,
//         shippingAddress: {
//           address: "NA",
//           city: "NA",
//           postalCode: "NA",
//           country: "NA",
//         },
//         paymentMethod: "Stripe",
//         itemsPrice,
//         taxPrice: 0,
//         shippingPrice: 0,
//         totalPrice: itemsPrice,
//       };

//       // ⭐ Submit Order to Backend
//       const result = await dispatch(createOrder(orderData));


//       console.log("resultresult",result)
//       if (result.meta.requestStatus === "fulfilled") {
//         alert("sssssss")
//         dispatch(clearCart());
//         navigate(`/order/${result.payload._id}`);
//       }
//     };

//     processOrder();
//   }, [dispatch, sessionId, navigate]);

//   return (
//     <div className="text-center mt-5">
//       <h1>Processing Payment...</h1>
//       <p>Please wait</p>
//     </div>
//   );
// };

// export default PaymentSuccessScreen;
import React, { useEffect,useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createOrder } from "../store/slices/orderSlice";
import { clearCart } from "../store/slices/cartSlice";
import axios from "../api/axios";

const PaymentSuccessScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const sessionId = params.get("session_id");
    const [statusScreen, setStatusScreen] = useState("loading"); 
      useEffect(() => {
    // ⏳ Change UI after 5 seconds
    const screenTimer = setTimeout(() => {
      setStatusScreen("confirmed");
    }, 5000);

    return () => clearTimeout(screenTimer);
  }, []);

  useEffect(() => {
    const processOrder = async () => {
      if (!sessionId) return;

      // Fetch Stripe session
      const { data: session } = await axios.get(
        `/payment/session/${sessionId}`
      );

      const stripeShipping = session.customer_details?.address;

      // Cart data
      const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
      if (cartItems.length === 0) return;

      const itemsPrice = cartItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
      );

      // Build shipping address
      const shippingAddress = {
        address: stripeShipping?.line1 || "Not Provided",
        city: stripeShipping?.city || "Unknown",
        postalCode: stripeShipping?.postal_code || "000000",
        country: stripeShipping?.country || "Unknown",
      };

      // ⭐ IMPORTANT FIX — add product field for backend
      const formattedItems = cartItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item._id, // REQUIRED FIELD
      }));

      const orderData = {
        orderItems: formattedItems,
        shippingAddress,
        paymentMethod: "Stripe",
        itemsPrice,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: itemsPrice,
      };

      // Create order
      const result = await dispatch(createOrder(orderData));

      console.log("Order Response:", result);

      if (result.meta.requestStatus === "fulfilled") {
        dispatch(clearCart());
        navigate(`/order/${result.payload._id}`);
      }
    };

    processOrder();
  }, [dispatch, sessionId, navigate]);

  return (
   <div className="text-center mt-5">

      {statusScreen === "loading" && (
        <>
          <h1>Processing Payment...</h1>
          <p>Please wait while we confirm your order.</p>
        </>
      )}

      {statusScreen === "confirmed" && (
        <>
          <h1 style={{ color: "green", fontSize: "28px" }}>✔️ Order Confirmed</h1>
          <p>Your order is successfully placed.</p>
        </>
      )}
    </div>
  );
};

export default PaymentSuccessScreen;
