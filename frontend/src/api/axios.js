import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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

export default api


