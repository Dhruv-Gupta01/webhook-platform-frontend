import axios from 'axios'

// In dev: Vite proxies /api → localhost:3000
// In prod: VITE_API_URL points to the Railway backend (e.g. https://xxx.railway.app)
const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'
const client = axios.create({ baseURL })

// Request interceptor — attach JWT from localStorage to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — auto-logout on 401 (token expired or invalid)
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default client
