import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";

// The server looks up prices itself, so only ids and quantities are sent
export const createCheckoutSessionThunk = createAsyncThunk(
  "payment/createCheckoutSession",
  async (cartItems, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/payment/create-checkout-session", {
        cartItems: cartItems.map(({ _id, qty }) => ({ _id, qty })),
      });
      return data; // { url }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Could not start checkout");
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
