import axiosInstance from "@/lib/api/axios-instance"
import type { LoginRequest, LoginResponse } from "@/types/auth"
import { cookies } from "@/lib/utils/cookies"

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>("https://lemarchenoble.id.vn/api/v1/identity/auth/login", credentials)
    return response.data
  },

  logout: async (): Promise<void> => {
    cookies.remove("token")
  },
}
