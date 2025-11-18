// services/order-service.ts
import axiosInstance from "@/lib/api/axios-instance";
import type { ShopOrder, OrderStatus, OrderSearchParams, ShopOrdersResponse } from "@/types/order";

const ORDER_API = "http://localhost:9002/v1/orders";

export const orderService = {
  // Get all shop orders for seller
  getShopOrders: async (params: OrderSearchParams): Promise<ShopOrdersResponse> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await axiosInstance.get<ShopOrdersResponse>(
      `${ORDER_API}/admin/shop-orders?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<ShopOrder> => {
    const response = await axiosInstance.get<{ result: ShopOrder }>(
      `${ORDER_API}/admin/shop-orders/${orderId}`
    );
    return response.data.result;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<void> => {
    await axiosInstance.put(`${ORDER_API}/callback_payment_online/${orderId}`, {
      status,
    });
  },
};