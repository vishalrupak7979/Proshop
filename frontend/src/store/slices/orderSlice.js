import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";

// CREATE ORDER
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/orders", orderData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create order"
      );
    }
  }
);

// GET ALL ORDERS (ADMIN)
export const getAllOrders = createAsyncThunk(
  "orders/getAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/orders/admin");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load orders"
      );
    }
  }
);

// GET ORDER BY ID
export const getOrderById = createAsyncThunk(
  "orders/getOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/orders/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Order not found"
      );
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    order: null,
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetOrder(state) {
      state.order = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // CREATE ORDER
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADMIN LIST ORDERS
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET ORDER BY ID
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
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

export const { resetOrder } = orderSlice.actions;
export default orderSlice.reducer;
