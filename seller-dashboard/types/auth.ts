export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  code: number
  result: {
    token: string
  }
}

export interface User {
  userId: string
  username: string
  email: string
  role: string
  shopId?: string
}
