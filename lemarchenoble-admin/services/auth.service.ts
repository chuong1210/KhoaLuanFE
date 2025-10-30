import apiClient from "@/lib/axios"
import type { ApiResponse } from "@/types"

interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  token: string
}

export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>("/identity/auth/login", credentials)
    return response.data.result
  },

  logout: async () => {
    await apiClient.post("/identity/auth/logout")
  },
}
