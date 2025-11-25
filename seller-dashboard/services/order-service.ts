// services/order-service.ts
import axiosInstance from "@/lib/api/axios-instance";
import type { ShopOrder, OrderStatus, OrderSearchParams, ShopOrdersResponse, OrderDetailResponseResult } from "@/types/order";

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
    const response = await axiosInstance.get<{ result: OrderDetailResponseResult }>(
      `${ORDER_API}/${orderId}`
    );
    return response.data.result.order_shop;
  },

  // Update order status - SỬA LẠI ĐỂ DÙNG API MỚI
  updateOrderStatus: async (
    shopOrderId: string, 
    status: OrderStatus, 
    shopId: string,
    reason?: string
  ): Promise<void> => {
    const response = await axiosInstance.put(
      `${ORDER_API}/admin/update_status?shop_id=${shopId}`,
      {
        status,
        shop_order_id: shopOrderId,
        reason: reason || "",
      }
    );

    // Kiểm tra response status
    if (response.data.code !== 200) {
      throw new Error(response.data.message || "Cập nhật trạng thái thất bại");
    }
  },
};