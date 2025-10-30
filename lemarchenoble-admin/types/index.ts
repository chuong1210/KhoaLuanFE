export interface ApiResponse<T> {
  code: number
  result: T
  message?: string
}

export interface PaginatedResponse<T> {
  currentPage: number
  totalPages: number
  totalElements: number
  responses: T[]
}

export interface User {
  id: string
  email: string
  username: string
  role: string
}

export interface Shop {
  id: string
  name: string
  description: string
  logo: string
  isActive: boolean
  createdDate: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  shopId: string
  categoryId: string
  isActive: boolean
  createdDate: string
}

export interface Order {
  id: string
  orderCode: string
  userId: string
  totalAmount: number
  status: string
  createdDate: string
}
