// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'
import { authApi } from '@/lib/api'
import { cookies } from '@/lib/cookies' // Import file cookie vừa tạo
import type { AuthState, DecodedToken, LoginRequest, LoginResponse, User } from '@/types/auth'

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Mặc định là true để chờ check cookie lần đầu
  error: null,
}

// Helper decode (giữ nguyên logic cũ của bạn)
const decodeTokenToUser = (token: string): User | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    if (decoded.exp * 1000 < Date.now()) return null
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

// 1. Login Async: Lưu vào Cookie
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.post<LoginResponse>('/auth/login', credentials)

      if (response.data.code === 10000 && response.data.result?.token) {
        const token = response.data.result.token
        const user = decodeTokenToUser(token)

        if (!user || (user.role !== 'ROLE_ADMIN' && user.role !== 'ROLE_SELLER')) {
          return rejectWithValue('Không có quyền truy cập')
        }

        // THAY ĐỔI Ở ĐÂY: Lưu vào Cookie thay vì LocalStorage
        cookies.set('token', token, 7) 
        console.log(cookies.get('token'))

        return { token, user }
      }
      return rejectWithValue('Đăng nhập thất bại')
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi hệ thống')
    }
  }
)

// 2. Initialize: Đọc từ Cookie
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // THAY ĐỔI Ở ĐÂY: Đọc từ Cookie
      const token = cookies.get('token')

      if (!token) return rejectWithValue('No token')

      const user = decodeTokenToUser(token)
      if (!user) {
        cookies.remove('token') // Token rác thì xóa đi
        return rejectWithValue('Invalid token')
      }

      return { token, user }
    } catch {
      return rejectWithValue('Failed')
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
      // THAY ĐỔI: Xóa Cookie
      cookies.remove('token')
      
      // Force reload để middleware đá về login ngay lập tức hoặc dùng router.push
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login' 
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => { state.isLoading = true; state.error = null })
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
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer