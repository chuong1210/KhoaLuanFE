import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface AuthState {
  token: string | null
  userId: string | null
  role: string | null
  isAuthenticated: boolean
  loading: boolean
}

const initialState: AuthState = {
  token: null,
  userId: null,
  role: null,
  isAuthenticated: false,
  loading: true,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ token: string; userId: string; role: string }>) => {
      state.token = action.payload.token
      state.userId = action.payload.userId
      state.role = action.payload.role
      state.isAuthenticated = true
      localStorage.setItem("token", action.payload.token)
    },
    logout: (state) => {
      state.token = null
      state.userId = null
      state.role = null
      state.isAuthenticated = false
      localStorage.removeItem("token")
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setAuth, logout, setLoading } = authSlice.actions
export default authSlice.reducer
