// import React from 'react'
// import { useSelector, useDispatch } from 'react-redux'
// import { Row, Col, ListGroup, Image, Button, Form, Card } from 'react-bootstrap'
// import { Link, useNavigate } from 'react-router-dom'
// import { removeFromCart, addToCart } from '../store/slices/cartSlice'
// import {
//   createOrderThunk,
//   verifyPaymentThunk,
//   createFinalOrderThunk,
// } from "../store/slices/paymentSlice";

// const CartScreen = () => {
//   const dispatch = useDispatch()
//   const navigate = useNavigate()
//   const { cartItems } = useSelector((state) => state.cart)


//   const { userInfo } = useSelector((state) => state.user);

//   const handlePayment = async () => {
//     // 1️⃣ Create order on backend
//     const order = await dispatch(createOrderThunk(totalPrice)).unwrap();

//     const options = {
//       key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//       amount: order.amount,
//       currency: order.currency,
//       order_id: order.orderId,
//       name: "ProShop",
//       description: "Order Payment",

//       handler: async (response) => {
//         const verify = await dispatch(verifyPaymentThunk(response)).unwrap();

//         if (verify.success) {
//           // 3️⃣ Create final order (save in DB)
//           await dispatch(
//             createFinalOrderThunk({
//               orderItems: cartItems,
//               paymentInfo: response,
//               totalPrice: totalPrice,
//               user: userInfo._id,
//             })
//           );

//           alert("Payment Successful!");
//         }
//       },
//     };

//     const rzp = new window.Razorpay(options);
//     rzp.open();
//   };


//   const removeFromCartHandler = (id) => {
//     dispatch(removeFromCart(id))
//   }

//   const qtyChangeHandler = (item, qty) => {
//     dispatch(addToCart({ ...item, qty }))
//   }

//   const checkoutHandler = () => {
//     navigate('/login?redirect=shipping')
//   }

//   return (
//     <Row>
//       <Col md={8}>
//         <h1>Shopping Cart</h1>
//         {cartItems.length === 0 ? (
//           <div>Your cart is empty <Link to="/">Go Back</Link></div>
//         ) : (
//           <ListGroup variant="flush">
//             {cartItems.map((item) => (
//               <ListGroup.Item key={item._id}>
//                 <Row className="align-items-center">
//                   <Col md={2}>
//                     <Image  src={`${import.meta.env.VITE_API_URL}${item.image}`}  alt={item.name} fluid rounded />
//                   </Col>
//                   <Col md={3}>
//                     <Link to={`/product/${item._id}`}>{item.name}</Link>
//                   </Col>
//                   <Col md={2}>₹{item.price}</Col>
//                   <Col md={2}>
//                     <Form.Select
//                       value={item.qty}
//                       onChange={(e) => qtyChangeHandler(item, Number(e.target.value))}
//                     >
//                       {[...Array(item.countInStock).keys()].map((x) => (
//                         <option key={x + 1} value={x + 1}>{x + 1}</option>
//                       ))}
//                     </Form.Select>
//                   </Col>
//                   <Col md={2}>
//                     <Button type="button" variant="light" onClick={() => removeFromCartHandler(item._id)}>
//                       <i className="fas fa-trash"></i>
//                     </Button>
//                   </Col>
//                 </Row>
//               </ListGroup.Item>
//             ))}
//           </ListGroup>
//         )}
//       </Col>

//       <Col md={4}>
//         <Card>
//           <ListGroup variant="flush">
//             <ListGroup.Item>
//               <h2>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items</h2>
//               ₹{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
//             </ListGroup.Item>
//             <ListGroup.Item>
//               <div className="d-grid">
//                 <Button type="button" className="btn-block" disabled={cartItems.length === 0} onClick={handlePayment}>
//                   Proceed To Checkout
//                 </Button>
//               </div>
//             </ListGroup.Item>
//           </ListGroup>
//         </Card>
//       </Col>
//     </Row>
//   )
// }

// export default CartScreen


import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, ListGroup, Image, Button, Form, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { removeFromCart, addToCart } from "../store/slices/cartSlice";
import { createCheckoutSessionThunk } from "../store/slices/paymentSlice";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CartScreen = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { sessionId, loading } = useSelector((state) => state.payment);

  const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2);

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const qtyChangeHandler = (item, qty) => {
    dispatch(addToCart({ ...item, qty }));
  };

// const handlePayment = async () => {
//   try {
//     const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-checkout-session`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ cartItems }),
//     });
//     const data = await res.json();

//     // Open Stripe checkout in new tab
//     window.open(data.url, "_blank"); 
//   } catch (error) {
//     console.error(error);
//     alert("Payment initiation failed");
//   }
// };

const handlePayment = async () => {
  const result = await dispatch(createCheckoutSessionThunk(cartItems));

  if (result.meta.requestStatus === "fulfilled") {
    const url = result.payload.url;

    // ⭐ OPEN STRIPE IN SAME TAB
    window.location.href = url;
  } else {
    alert("Payment failed: " + result.payload);
  }
};


  // useEffect(() => {
  //   // Reset payment state when leaving cart page
  //   return () => {
  //     dispatch(resetPayment());
  //   };
  // }, [dispatch]);

  return (
    <Row>
      <Col md={8}>
        <h1>Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <div>
            Your cart is empty <Link to="/">Go Back</Link>
          </div>
        ) : (
          <ListGroup variant="flush">
            {cartItems.map((item) => (
              <ListGroup.Item key={item._id}>
                <Row className="align-items-center">
                  <Col md={2}>
                    <Image src={`${import.meta.env.VITE_API_URL}${item.image}`} alt={item.name} fluid rounded />
                  </Col>
                  <Col md={3}>
                    <Link to={`/product/${item._id}`}>{item.name}</Link>
                  </Col>
                  <Col md={2}>₹{item.price}</Col>
                  <Col md={2}>
                    <Form.Select
                      value={item.qty}
                      onChange={(e) => qtyChangeHandler(item, Number(e.target.value))}
                    >
                      {[...Array(item.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Button type="button" variant="light" onClick={() => removeFromCartHandler(item._id)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Col>

      <Col md={4}>
        <Card>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>
                Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items
              </h2>
              ₹{totalPrice}
            </ListGroup.Item>
            <ListGroup.Item>
              <div className="d-grid">
                <Button type="button" disabled={cartItems.length === 0 || loading} onClick={handlePayment}>
                  {loading ? "Processing..." : "Proceed To Checkout"}
                </Button>
              </div>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  );
};

export default CartScreen;
