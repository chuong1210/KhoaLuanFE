import apiClient from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, Shop } from "@/types"

export const shopService = {
  getShops: async (page = 1, limit = 10, filters?: any) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Shop>>>("/shops", {
      params: { page, limit, ...filters },
    })
    return response.data.result
  },

  getShopById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Shop>>(`/shops/${id}`)
    return response.data.result
  },

  createShop: async (data: Partial<Shop>) => {
    const response = await apiClient.post<ApiResponse<Shop>>("/shops", data)
    return response.data.result
  },

  updateShop: async (id: string, data: Partial<Shop>) => {
    const response = await apiClient.put<ApiResponse<Shop>>(`/shops/${id}`, data)
    return response.data.result
  },

  deleteShop: async (id: string) => {
    await apiClient.delete(`/shops/${id}`)
  },

  approveShop: async (id: string) => {
    const response = await apiClient.post<ApiResponse<Shop>>(`/shops/${id}/approve`)
    return response.data.result
  },

  rejectShop: async (id: string, feedback: string) => {
    const response = await apiClient.post<ApiResponse<Shop>>(`/shops/${id}/reject`, { feedback })
    return response.data.result
  },
}
