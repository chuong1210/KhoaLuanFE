import apiClient from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, Order } from "@/types"

export async function getOrders(page = 1, limit = 10, filters?: any) {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>("/orders", {
    params: { page, limit, ...filters },
  })
  return response.data.result
}

export async function getOrderById(id: string) {
  const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`)
  return response.data.result
}

export async function updateOrderStatus(id: string, status: string) {
  const response = await apiClient.put<ApiResponse<Order>>(`/orders/${id}`, { status })
  return response.data.result
}
