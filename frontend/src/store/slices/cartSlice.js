import { createSlice } from '@reduxjs/toolkit'
import { readJSON } from '../../utils/storage'
import { lineKey } from '../../utils/cartLine'

const initialState = {
  cartItems: readJSON('cartItems', []),
  shippingAddress: readJSON('shippingAddress', null),
  paymentMethod: localStorage.getItem('paymentMethod') || ''
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const item = action.payload
      const exist = state.cartItems.find((x) => lineKey(x) === lineKey(item))
      if (exist) {
        state.cartItems = state.cartItems.map((x) => (x === exist ? item : x))
      } else {
        state.cartItems.push(item)
      }
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems))
    },
    // Offers and stock can change after an item was added
    refreshCartItems(state, action) {
      state.cartItems = state.cartItems.flatMap((item) => {
        const latest = action.payload.find((p) => p._id === item._id)
        return latest
          ? [{ ...latest, color: item.color, image: item.image, qty: Math.min(item.qty, Math.max(latest.countInStock, 1)) }]
          : []
      })
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems))
    },
    removeFromCart(state, action) {
      state.cartItems = state.cartItems.filter((x) => lineKey(x) !== action.payload)
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems))
    },
    clearCart(state) {
      state.cartItems = []
      localStorage.removeItem('cartItems')
    },
    saveShippingAddress(state, action) {
      state.shippingAddress = action.payload
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload))
    },
    savePaymentMethod(state, action) {
      state.paymentMethod = action.payload
      localStorage.setItem('paymentMethod', action.payload)
    }
  }
})

export const { addToCart, refreshCartItems, removeFromCart, clearCart, saveShippingAddress, savePaymentMethod } = cartSlice.actions
export default cartSlice.reducer
