// features/orders/services/ordersApi.ts

import { orderApi, ApiResponse } from '@/lib/api'
import { parseQueryParams } from '@/lib/utils'
import type { 
  OrderWithShop, 
  OrderSearchParams, 
  OrdersResponse,
  UpdateOrderStatusRequest,
  CancelOrderRequest 
} from '../types'

export const ordersService = {
  /**
   * Search orders with comprehensive filters
   */
  searchOrders: async (params: OrderSearchParams): Promise<OrdersResponse> => {
    const queryString = parseQueryParams(params)
    const response = await orderApi.get<ApiResponse<OrdersResponse>>(
      `/orders/search/detail?${queryString}`
    )
    return response.data.result
  },

  /**
   * Get order by ID
   */
  getOrder: async (orderId: string): Promise<OrderWithShop> => {
    const response = await orderApi.get<ApiResponse<OrderWithShop>>(
      `/orders/${orderId}`
    )
    return response.data.result
  },

  /**
   * Get orders by shop ID
   */
  getShopOrders: async (
    shopId: string, 
    params?: Omit<OrderSearchParams, 'shop_id'>
  ): Promise<OrdersResponse> => {
    const queryString = parseQueryParams({ ...params, shop_id: shopId })
    const response = await orderApi.get<ApiResponse<OrdersResponse>>(
      `/orders/search/detail?${queryString}`
    )
    return response.data.result
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (
    orderId: string, 
    data: UpdateOrderStatusRequest
  ): Promise<boolean> => {
    const response = await orderApi.patch<ApiResponse<boolean>>(
      `/orders/${orderId}/status`,
      data
    )
    return response.data.result
  },

  /**
   * Cancel order
   */
  cancelOrder: async (
    orderId: string, 
    data: CancelOrderRequest
  ): Promise<boolean> => {
    const response = await orderApi.post<ApiResponse<boolean>>(
      `/orders/${orderId}/cancel`,
      data
    )
    return response.data.result
  },

  /**
   * Get order statistics
   */
  getOrderStats: async (params?: {
    shop_id?: string
    date_from?: string
    date_to?: string
  }): Promise<{
    total_orders: number
    total_revenue: number
    by_status: Record<string, number>
  }> => {
    const queryString = parseQueryParams(params || {})
    const response = await orderApi.get<ApiResponse<any>>(
      `/orders/stats?${queryString}`
    )
    return response.data.result
  },

  /**
   * Export orders to CSV
   */
  exportOrders: async (params: OrderSearchParams): Promise<Blob> => {
    const queryString = parseQueryParams(params)
    const response = await orderApi.get(
      `/orders/export?${queryString}`,
      { responseType: 'blob' }
    )
    return response.data
  },
}