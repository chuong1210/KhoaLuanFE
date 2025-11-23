import { orderApi, ApiResponse, PaginatedResult } from '@/lib/api'
import { parseQueryParams } from '@/lib/utils'
import type { OrderWithShop, OrderSearchParams } from '../types'

export const ordersService = {
  // Search orders with filters
  searchOrders: async (params: OrderSearchParams) => {
    const queryString = parseQueryParams(params)
    const response = await orderApi.get<ApiResponse<PaginatedResult<OrderWithShop>>>(
      `/orders/search/detail?${queryString}`
    )
    return response.data.result
  },

  // Get order by ID
  getOrder: async (orderId: string) => {
    const response = await orderApi.get<ApiResponse<OrderWithShop>>(
      `/orders/${orderId}`
    )
    return response.data.result
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await orderApi.patch<ApiResponse<boolean>>(
      `/orders/${orderId}/status`,
      { status }
    )
    return response.data.result
  },

  // Cancel order
  cancelOrder: async (orderId: string, reason: string) => {
    const response = await orderApi.post<ApiResponse<boolean>>(
      `/orders/${orderId}/cancel`,
      { reason }
    )
    return response.data.result
  },
}
