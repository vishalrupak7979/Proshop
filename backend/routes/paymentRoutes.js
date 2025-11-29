// import express from "express";
// import { createOrder, verifyPayment } from "../controllers/paymentController.js";

// const router = express.Router();

// router.post("/create-order", createOrder);
// router.post("/verify-payment", verifyPayment);

// export default router;


import express from "express";
import { createCheckoutSession ,getStripeSession } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);

router.get("/session/:id", getStripeSession);
export default router;
