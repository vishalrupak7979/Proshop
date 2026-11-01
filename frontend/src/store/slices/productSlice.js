import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchProducts = createAsyncThunk('products/fetchPage', async (params, { rejectWithValue, signal }) => {
  try {
    const { data } = await api.get('/products', { params, signal })
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
  initialState: { products: [], page: 1, pages: 1, total: 0, limit: 12, categories: [], product: null, loading: true, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const { products, page, pages, total, limit, categories } = action.payload
        Object.assign(state, { loading: false, products, page, pages, total, limit, categories })
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        // A newer request replaced this one, so its result no longer matters
        if (action.meta.aborted) return
        state.loading = false
        state.error = action.payload
      })

      .addCase(fetchProductById.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.loading = false; state.product = action.payload })
      .addCase(fetchProductById.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  }
})

export default productSlice.reducer
