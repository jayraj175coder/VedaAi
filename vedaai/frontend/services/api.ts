import axios, { AxiosError } from 'axios'
import Cookies from 'js-cookie'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token')
      if (typeof window !== 'undefined') {
        const isAuthPage = window.location.pathname.includes('/login') || 
                           window.location.pathname.includes('/register')
        if (!isAuthPage) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  register: async (data: { name: string; email: string; password: string; school?: string }) => {
    const res = await api.post('/auth/register', data)
    return res.data
  },
  login: async (data: { email: string; password: string }) => {
    const res = await api.post('/auth/login', data)
    return res.data
  },
  getProfile: async () => {
    const res = await api.get('/auth/profile')
    return res.data
  },
  updateProfile: async (data: { name?: string; school?: string }) => {
    const res = await api.put('/auth/profile', data)
    return res.data
  },
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await api.put('/auth/change-password', data)
    return res.data
  },
}

export const assignmentService = {
  getAll: async (params?: { page?: number; search?: string; status?: string }) => {
    const res = await api.get('/assignments', { params })
    return res.data
  },
  getById: async (id: string) => {
    const res = await api.get(`/assignments/${id}`)
    return res.data.data
  },
  create: async (data: FormData) => {
    const res = await api.post('/assignments', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },
  update: async (id: string, data: object) => {
    const res = await api.put(`/assignments/${id}`, data)
    return res.data.data
  },
  delete: async (id: string) => {
    const res = await api.delete(`/assignments/${id}`)
    return res.data
  },
  generatePaper: async (id: string) => {
    const res = await api.post(`/assignments/${id}/generate`)
    return res.data
  },
  downloadPDF: async (id: string) => {
    const res = await api.get(`/assignments/${id}/pdf`, { responseType: 'blob' })
    return res.data
  },
}

export default api
