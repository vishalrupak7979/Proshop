// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "../../api/axios";

// // 1️⃣ Create Razorpay order
// export const createOrderThunk = createAsyncThunk(
//   "payment/createOrder",
//   async (amount, thunkAPI) => {
//     try {
//       const { data } = await axios.post("/api/payment/create-order", {
//         amount,
//       });
//       return data; // { orderId, amount, currency }
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// // 2️⃣ Verify Razorpay payment
// export const verifyPaymentThunk = createAsyncThunk(
//   "payment/verifyPayment",
//   async (response, thunkAPI) => {
//     try {
//       const { data } = await axios.post("/api/payment/verify-payment", response);
//       return data; // { success: true }
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );


// // 3️⃣ Save final order to backend (optional, recommended)
// export const createFinalOrderThunk = createAsyncThunk(
//   "payment/createFinalOrder",
//   async (orderData, thunkAPI) => {
//     try {
//       const { data } = await axios.post("/api/orders", orderData);
//       return data; 
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// const paymentSlice = createSlice({
//   name: "payment",
//   initialState: {
//     loading: false,
//     success: false,
//     error: null,
//     orderDetails: null,
//   },
//   reducers: {
//     resetPaymentState: (state) => {
//       state.loading = false;
//       state.success = false;
//       state.error = null;
//       state.orderDetails = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Create Razorpay Order
//       .addCase(createOrderThunk.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(createOrderThunk.fulfilled, (state, action) => {
//         state.loading = false;
//         state.orderDetails = action.payload;
//       })
//       .addCase(createOrderThunk.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Verify Payment
//       .addCase(verifyPaymentThunk.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(verifyPaymentThunk.fulfilled, (state, action) => {
//         state.loading = false;
//         state.success = action.payload.success;
//       })
//       .addCase(verifyPaymentThunk.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Save final order
//       .addCase(createFinalOrderThunk.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(createFinalOrderThunk.fulfilled, (state) => {
//         state.loading = false;
//         state.success = true;
//       })
//       .addCase(createFinalOrderThunk.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { resetPaymentState } = paymentSlice.actions;
// export default paymentSlice.reducer;// src/store/slices/paymentSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";

// =====================
// Create Checkout Session
// =====================
export const createCheckoutSessionThunk = createAsyncThunk(
  "payment/createCheckoutSession",
  async (cartItems, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/payment/create-checkout-session", {
        cartItems,
      });
      return data; // { url }
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Payment error");
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    loading: false,
    error: null,
    url: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // Create checkout session
      .addCase(createCheckoutSessionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckoutSessionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.url = action.payload.url;
      })
      .addCase(createCheckoutSessionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default paymentSlice.reducer;
