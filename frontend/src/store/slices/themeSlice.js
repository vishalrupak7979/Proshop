import { createSlice } from '@reduxjs/toolkit'

const themeSlice = createSlice({
  name: 'theme',
  // Set by the inline script in index.html, so the page never flashes the wrong theme
  initialState: { mode: document.documentElement.getAttribute('data-bs-theme') || 'light' },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('theme', state.mode)
      } catch (e) {
        // ignore blocked storage, the theme just won't persist
      }
    }
  }
})

export const { toggleTheme } = themeSlice.actions
export default themeSlice.reducer
