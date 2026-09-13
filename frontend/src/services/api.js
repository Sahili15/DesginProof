import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://remarks-fighting-series-diabetes.trycloudflare.com',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 600000), // 10 minutes timeout
})


// Request interceptor to add auth token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
