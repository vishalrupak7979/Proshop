import { configureStore } from '@reduxjs/toolkit'
import productReducer from './slices/productSlice'
import cartReducer from './slices/cartSlice'
import userReducer from './slices/userSlice'
import paymentReducer from "./slices/paymentSlice";
import orderReducer from "./slices/orderSlice";
const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    user: userReducer,
    payment: paymentReducer,
     orders: orderReducer,
  },
})

export default store
