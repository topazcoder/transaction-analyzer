import axios from 'axios'
import { AuthResponse, SignUpRequest, SignInRequest, User } from '../types/auth'
import { API_BASE_URL } from '@/config'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('idToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('idToken')
      window.location.href = '/signin'
    }

    return Promise.reject(error)
  }
)

export const authService = {
  async signUp(request: SignUpRequest): Promise<void> {
    await api.post('/auth/signup', request)
  },

  async signIn(request: SignInRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signin', request)

    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')

    return response.data
  }
}
