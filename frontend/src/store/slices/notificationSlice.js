import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'
import { logout } from './userSlice'

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const { data } = await api.get('/notifications')
  return data
})

export const markNotificationRead = createAsyncThunk('notifications/read', async (id) => {
  await api.put(`/notifications/${id}/read`)
  return id
})

export const markAllNotificationsRead = createAsyncThunk('notifications/readAll', async () => {
  await api.put('/notifications/read-all')
})

const initialState = { items: [], unread: 0 }

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => initialState)
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.notifications
        state.unread = action.payload.unread
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const item = state.items.find((x) => x._id === action.payload)
        if (item && !item.read) {
          item.read = true
          state.unread = Math.max(0, state.unread - 1)
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((item) => { item.read = true })
        state.unread = 0
      })
  }
})

export default notificationSlice.reducer
