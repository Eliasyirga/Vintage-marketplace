import axios from 'axios'

const RAW_BASE_URL = (import.meta.env.VITE_API_URL || 'https://vintage-marketplace-6.onrender.com/api').trim()
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '')

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send HttpOnly cookies (refresh token)
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// On 401, attempt silent refresh using HttpOnly cookie before failing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/register')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        )

        const newAccessToken = response.data?.data?.accessToken
        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken)
          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          processQueue(null, newAccessToken)
          return api(originalRequest)
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        localStorage.removeItem('accessToken')
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api

