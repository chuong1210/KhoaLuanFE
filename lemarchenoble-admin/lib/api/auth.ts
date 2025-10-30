import apiClient from "@/lib/axios"
import type { ApiResponse, User } from "@/types"

export async function login(credentials: { username: string; password: string }) {
  const response = await apiClient.post<ApiResponse<{ token: string; user: User }>>("identity/auth/login", credentials)
  return response.data.result
}

export async function logout() {
  await apiClient.post("identity/auth/logout")
}

export async function refreshToken(token: string) {
  const response = await apiClient.post<ApiResponse<{ token: string }>>("identity/auth/refresh", { token })
  return response.data.result
}
