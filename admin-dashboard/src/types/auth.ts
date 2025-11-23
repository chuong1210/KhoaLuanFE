export interface User {
  userId: string
  username: string
  email: string
  role: UserRole
}

export type UserRole = 'ROLE_ADMIN' | 'ROLE_SELLER' | 'ROLE_USER'

export interface DecodedToken {
  sub: string // username
  scope: UserRole // role
  iss: string
  exp: number
  iat: number
  userId: string
  jti: string
  email: string
}

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

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
