import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchProducts = createAsyncThunk('products/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const fetchProductById = createAsyncThunk('products/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message)
  }
})

const productSlice = createSlice({
  name: 'products',
  initialState: { products: [], product: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchProducts.fulfilled, (state, action) => { state.loading = false; state.products = action.payload })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(fetchProductById.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.loading = false; state.product = action.payload })
      .addCase(fetchProductById.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  }
})

export default productSlice.reducer
