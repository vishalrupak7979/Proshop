import { createSlice } from '@reduxjs/toolkit'
import { readJSON } from '../../utils/storage'

export const MAX_COMPARE = 4

const save = (ids) => {
  try {
    localStorage.setItem('compareIds', JSON.stringify(ids))
  } catch (e) {
    // ignore blocked storage, the list just won't persist
  }
}

const compareSlice = createSlice({
  name: 'compare',
  initialState: { ids: readJSON('compareIds', []) },
  reducers: {
    addToCompare(state, action) {
      if (!state.ids.includes(action.payload) && state.ids.length < MAX_COMPARE) {
        state.ids.push(action.payload)
        save(state.ids)
      }
    },
    removeFromCompare(state, action) {
      state.ids = state.ids.filter((id) => id !== action.payload)
      save(state.ids)
    },
    clearCompare(state) {
      state.ids = []
      save(state.ids)
    }
  }
})

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions
export default compareSlice.reducer
