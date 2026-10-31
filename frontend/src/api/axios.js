import axios from 'axios'

export const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: baseURL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('userInfo') || 'null')
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
  } catch (e) {
    // ignore parse error
  }
  return config
})

// An expired session should lead to sign in, not a broken page
api.interceptors.response.use(undefined, (error) => {
  const isAuthRoute = error.config?.url?.startsWith('/users')
  const onSignIn = window.location.pathname === '/login'

  if (error.response?.status === 401 && !isAuthRoute && !onSignIn) {
    localStorage.removeItem('userInfo')
    window.location.assign(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
  }
  return Promise.reject(error)
})

export default api


