import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const loginUser = createAsyncThunk(
  'user/login',
  async ({ email, password }, thunkAPI) => {
    try {
      const { data } = await api.post('/users/login', { email, password })

      localStorage.setItem('userInfo', JSON.stringify(data))
      return data
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Invalid email or password"
      )
    }
  }
)

export const registerUser = createAsyncThunk('user/register', async ({ name, email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/users', { name, email, password })
    localStorage.setItem('userInfo', JSON.stringify(data))
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message)
  }
})

const initialState = {
  userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
  loading: false,
  error: null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout(state) {
      state.userInfo = null
      localStorage.removeItem('userInfo')
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.userInfo = action.payload })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.userInfo = action.payload })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  }
})

export const { logout } = userSlice.actions
export default userSlice.reducer
