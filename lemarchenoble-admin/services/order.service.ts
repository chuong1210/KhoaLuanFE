import apiClient from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, Order } from "@/types"

export const orderService = {
  getOrders: async (page = 1, limit = 10, filters?: any) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>("/orders", {
      params: { page, limit, ...filters },
    })
    return response.data.result
  },

  getOrderById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`)
    return response.data.result
  },

  updateOrderStatus: async (id: string, status: string) => {
    const response = await apiClient.put<ApiResponse<Order>>(`/orders/${id}`, { status })
    return response.data.result
  },
}
