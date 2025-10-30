import apiClient from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, Shop } from "@/types"

export async function getShops(page = 1, limit = 10, filters?: any) {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Shop>>>("/shops", {
    params: { page, limit, ...filters },
  })
  return response.data.result
}

export async function getShopById(id: string) {
  const response = await apiClient.get<ApiResponse<Shop>>(`/shops/${id}`)
  return response.data.result
}

export async function createShop(data: Partial<Shop>) {
  const response = await apiClient.post<ApiResponse<Shop>>("/shops", data)
  return response.data.result
}

export async function updateShop(id: string, data: Partial<Shop>) {
  const response = await apiClient.put<ApiResponse<Shop>>(`/shops/${id}`, data)
  return response.data.result
}

export async function deleteShop(id: string) {
  await apiClient.delete(`/shops/${id}`)
}

export async function approveShop(id: string) {
  const response = await apiClient.post<ApiResponse<Shop>>(`/shops/${id}/approve`)
  return response.data.result
}

export async function rejectShop(id: string, feedback: string) {
  const response = await apiClient.post<ApiResponse<Shop>>(`/shops/${id}/reject`, { feedback })
  return response.data.result
}
