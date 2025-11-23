import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'
import { authApi } from '@/lib/api'
import type { AuthState, DecodedToken, LoginRequest, LoginResponse, User } from '@/types/auth'

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Helper function to decode token and extract user info
const decodeTokenToUser = (token: string): User | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token)

    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      return null
    }

    return {
      userId: decoded.userId,
      username: decoded.sub,
      email: decoded.email,
      role: decoded.scope,
    }
  } catch {
    return null
  }
}

// Async thunk for login
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.post<LoginResponse>('/auth/login', credentials)

      if (response.data.code === 10000 && response.data.result?.token) {
        const token = response.data.result.token
        const user = decodeTokenToUser(token)

        if (!user) {
          return rejectWithValue('Token không hợp lệ hoặc đã hết hạn')
        }

        // Check if user has admin or seller role
        if (user.role !== 'ROLE_ADMIN' && user.role !== 'ROLE_SELLER') {
          return rejectWithValue('Bạn không có quyền truy cập vào trang quản trị')
        }

        // Save token to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token)
        }

        return { token, user }
      }

      return rejectWithValue('Đăng nhập thất bại')
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        return rejectWithValue(axiosError.response?.data?.message || 'Đăng nhập thất bại')
      }
      return rejectWithValue('Đăng nhập thất bại')
    }
  }
)

// Async thunk for initializing auth from localStorage
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      if (typeof window === 'undefined') {
        return rejectWithValue('Not in browser')
      }

      const token = localStorage.getItem('token')

      if (!token) {
        return rejectWithValue('No token found')
      }

      const user = decodeTokenToUser(token)

      if (!user) {
        localStorage.removeItem('token')
        return rejectWithValue('Token expired or invalid')
      }

      return { token, user }
    } catch {
      return rejectWithValue('Failed to initialize auth')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null

      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
    },
    clearError: (state) => {
      state.error = null
    },
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Initialize
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
      })
  },
})

export const { logout, clearError, setCredentials } = authSlice.actions
export default authSlice.reducer
