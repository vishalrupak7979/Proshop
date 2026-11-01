import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";
import { logout } from "./userSlice";

// SAVE ORDER AFTER STRIPE PAYMENT
export const confirmStripeOrder = createAsyncThunk(
  "orders/confirmStripeOrder",
  async (sessionId, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/orders/stripe-success", { sessionId });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to confirm your order"
      );
    }
  }
);

// PLACE CASH ON DELIVERY ORDER
export const createCodOrder = createAsyncThunk(
  "orders/createCodOrder",
  async ({ cartItems, shippingAddress }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/orders/cod", {
        cartItems: cartItems.map(({ _id, qty }) => ({ _id, qty })),
        shippingAddress,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Could not place your order"
      );
    }
  }
);

// GET LOGGED IN USER'S ORDERS
export const getMyOrders = createAsyncThunk(
  "orders/getMyOrders",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/orders/mine");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load your orders"
      );
    }
  }
);

// GET ORDER BY ID
export const getOrderById = createAsyncThunk(
  "orders/getOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/orders/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Order not found"
      );
    }
  }
);

const initialState = {
  order: null,
  orders: [],
  loading: true,
  error: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      // Never show one customer's orders to the next person on this device
      .addCase(logout, () => initialState)

      // MY ORDERS
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET ORDER BY ID
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;
