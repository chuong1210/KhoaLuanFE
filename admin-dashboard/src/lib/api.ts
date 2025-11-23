import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

// Base API URLs
export const API_URLS = {
  PRODUCT: process.env.NEXT_PUBLIC_PRODUCT_API || 'http://localhost:9001/v1',
  ORDER: process.env.NEXT_PUBLIC_ORDER_API || 'http://localhost:9002/v1',
  SHOP: process.env.NEXT_PUBLIC_SHOP_API || 'http://localhost:8000/api',
  ANALYTICS: process.env.NEXT_PUBLIC_ANALYTICS_API || 'http://localhost:9004/v1',
  AUTH: process.env.NEXT_PUBLIC_AUTH_API || 'https://lemarchenoble.id.vn/api/v1/identity',
}

// Create axios instances for different services
export const productApi = axios.create({
  baseURL: API_URLS.PRODUCT,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const orderApi = axios.create({
  baseURL: API_URLS.ORDER,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const shopApi = axios.create({
  baseURL: API_URLS.SHOP,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const analyticsApi = axios.create({
  baseURL: API_URLS.ANALYTICS,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const authApi = axios.create({
  baseURL: API_URLS.AUTH,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
const addAuthToken = (config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
}

// Response interceptor to handle errors
const handleResponseError = (error: AxiosError) => {
  if (error.response?.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      window.location.href = '/auth/login'
    }
  }
  return Promise.reject(error)
}

// Apply interceptors to all instances
const apiInstances = [productApi, orderApi, shopApi, analyticsApi]
apiInstances.forEach((instance) => {
  instance.interceptors.request.use(addAuthToken)
  instance.interceptors.response.use((response) => response, handleResponseError)
})

// Generic API response type
export interface ApiResponse<T> {
  code: number
  message: string
  status: string
  result: T
}

export interface PaginatedResult<T> {
  currentPage: number
  data: T[]
  limit?: number
  pageSize?: number
  totalElements: number
  totalPages: number
}

export interface ShopApiResponse<T> {
  extra?: {
    currentPage: number
    totalPages: number
    totalElements: number
    pageSize: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
  result: T
  succeeded: boolean
  code: number
  messages?: string[]
}
