import { apiClient } from "@/lib/api/axios-instance"
import type { ShopOrder, OrderDetail, OrderStatus } from "@/types/order"

const SHOP_ORDER_API = "http://localhost:9000/api/ShopOrders"
const ORDER_ITEM_API = "http://localhost:9000/api/OrderItems"

export const orderService = {
  // Get all shop orders
  getShopOrders: async (): Promise<ShopOrder[]> => {
    const response = await apiClient.get(SHOP_ORDER_API)
    return response.data.result || response.data
  },

  // Get order by ID with items
  getOrderById: async (orderId: string): Promise<OrderDetail> => {
    const [orderResponse, itemsResponse] = await Promise.all([
      apiClient.get(`${SHOP_ORDER_API}/${orderId}`),
      apiClient.get(`${ORDER_ITEM_API}?orderId=${orderId}`),
    ])

    return {
      ...(orderResponse.data.result || orderResponse.data),
      items: itemsResponse.data.result || itemsResponse.data,
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<ShopOrder> => {
    const response = await apiClient.put(`${SHOP_ORDER_API}/${orderId}`, { status })
    return response.data.result || response.data
  },

  // Get orders by status
  getOrdersByStatus: async (status: OrderStatus): Promise<ShopOrder[]> => {
    const response = await apiClient.get(`${SHOP_ORDER_API}?status=${status}`)
    return response.data.result || response.data
  },
}
