
// services/order-service.ts
import axiosInstance from "@/lib/api/axios-instance";
import type { OrderDetail, OrderStatus, OrderSearchParams, OrderSearchResponse } from "@/types/order";

const ORDER_API = "http://localhost:9002/v1/orders";

export const orderService = {
  // Get order by ID
  getOrderById: async (orderId: string): Promise<OrderDetail> => {
    const response = await axiosInstance.get<{ result: OrderDetail }>(
      `${ORDER_API}/${orderId}`
    );
    return response.data.result;
  },

  // Search orders with filters
  searchOrders: async (params: OrderSearchParams): Promise<OrderSearchResponse> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await axiosInstance.get<OrderSearchResponse>(
      `${ORDER_API}/search/detail?${queryParams.toString()}`
    );
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<void> => {
    await axiosInstance.put(`${ORDER_API}/callback_payment_online/${orderId}`, {
      status,
    });
  },
};